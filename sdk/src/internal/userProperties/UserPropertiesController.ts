import {UserPropertiesController, UserPropertiesService, UserPropertiesStorage} from './types';
import {DelayedWorker} from '../utils/DelayedWorker';
import {Logger} from '../logger';
import {KEY_REGEX, SENDING_DELAY_MS} from './constants';
import {QonversionError} from '../../exception/QonversionError';
import {UserChangedListener, UserChangedNotifier, UserDataStorage} from '../user';
import UserProperties from '../../dto/UserProperties';
import UserProperty from '../../dto/UserProperty';
import {UserPropertyKey} from '../../dto/UserPropertyKey';

export class UserPropertiesControllerImpl implements UserPropertiesController, UserChangedListener {
  private readonly pendingUserPropertiesStorage: UserPropertiesStorage;
  private readonly sentUserPropertiesStorage: UserPropertiesStorage;
  private readonly userPropertiesService: UserPropertiesService;
  private readonly userDataStorage: UserDataStorage;
  private readonly delayedWorker: DelayedWorker;
  private readonly logger: Logger;
  private readonly sendingDelayMs: number;

  constructor(
    pendingUserPropertiesStorage: UserPropertiesStorage,
    sentUserPropertiesStorage: UserPropertiesStorage,
    userPropertiesService: UserPropertiesService,
    userDataStorage: UserDataStorage,
    delayedWorker: DelayedWorker,
    logger: Logger,
    userChangedNotifier: UserChangedNotifier,
    sendingDelayMs: number = SENDING_DELAY_MS
  ) {
    this.pendingUserPropertiesStorage = pendingUserPropertiesStorage;
    this.sentUserPropertiesStorage = sentUserPropertiesStorage;
    this.userPropertiesService = userPropertiesService;
    this.userDataStorage = userDataStorage;
    this.delayedWorker = delayedWorker;
    this.logger = logger;
    this.sendingDelayMs = sendingDelayMs;

    userChangedNotifier.subscribeOnUserChanges(this);
  }

  setProperty(key: string, value: string): void {
    this.setProperties({[key]: value})
  }

  setProperties(properties: Record<string, string>): void {
    this.logger.verbose('Setting user properties', properties);
    const validatedProperties: Record<string, string> = {};
    Object.keys(properties).forEach(key => {
      if (this.shouldSendProperty(key, properties[key])) {
        validatedProperties[key] = properties[key];
      }
    });
    this.pendingUserPropertiesStorage.add(validatedProperties);
    this.sendUserPropertiesIfNeeded();
  }

  async getProperties(): Promise<UserProperties> {
    this.logger.verbose('Requesting user properties');

    const userId = this.userDataStorage.requireOriginalUserId();
    const properties = await this.userPropertiesService.getProperties(userId);

    this.logger.verbose('User properties were received', properties);

    const mappedProperties = properties.map(userPropertyData =>
      new UserProperty(userPropertyData.key, userPropertyData.value)
    );
    return new UserProperties(mappedProperties);
  }

  onUserChanged(): void {
    this.pendingUserPropertiesStorage.clear();
    this.sentUserPropertiesStorage.clear();
  }

  private sendUserPropertiesIfNeeded(ignoreExistingJob: boolean = false) {
    const pendingProperties = this.pendingUserPropertiesStorage.getProperties();
    if (Object.keys(pendingProperties).length > 0) {
      this.delayedWorker.doDelayed(
        this.sendingDelayMs,
        async () =>  {
          await this.sendUserProperties();
        },
        ignoreExistingJob
      );
    }
  }

  private async sendUserProperties() {
    try {
      const propertiesToSend = {...this.pendingUserPropertiesStorage.getProperties()};
      if (Object.keys(propertiesToSend).length === 0) {
        return;
      }
      this.logger.verbose('Sending user properties', propertiesToSend);

      const userId = this.userDataStorage.requireOriginalUserId();
      const response = await this.userPropertiesService.sendProperties(
        userId,
        propertiesToSend,
      );

      const processedProperties: Record<string, string> = {};
      response.savedProperties.forEach(savedProperty => {
        processedProperties[savedProperty.key] = savedProperty.value;
      });

      this.logger.verbose('User properties were sent', response);

      // We delete all sent properties even if they were not successfully handled
      // to prevent spamming api with unacceptable properties.
      this.pendingUserPropertiesStorage.delete(propertiesToSend);
      this.sentUserPropertiesStorage.add(processedProperties);

      this.sendUserPropertiesIfNeeded(true);
    } catch (e) {
      if (e instanceof QonversionError) {
        this.logger.error('Failed to send user properties to api', e);
      }
    }
  }

  private shouldSendProperty(key: string, value: string): boolean {
    let shouldSend = true;
    if (key == UserPropertyKey.Custom) {
      shouldSend = false;
      this.logger.warn(
        "Can not set user property with the key `UserPropertyKey.Custom`. " +
        "To set custom user property, use the `setCustomUserProperty` method."
      );
    }

    if (shouldSend && !UserPropertiesControllerImpl.isValidKey(key)) {
      shouldSend = false;
      this.logger.error(
        `Invalid key "${key}" for user property. ` +
        'The key should be nonempty and may consist of letters A-Za-z, numbers, and symbols _.:-.'
      );
    }

    if (!UserPropertiesControllerImpl.isValidValue(value)) {
      shouldSend = false;
      this.logger.error(`The empty value provided for user property "${key}".`);
    }

    if (shouldSend && this.sentUserPropertiesStorage.getProperties()[key] == value) {
      shouldSend = false;
      this.logger.info(
        `The property with key: "${key}" and value: "${value}" ` +
        'has been sent already for the current user. SDK will not send it again to avoid any confusion.'
      );
    }

    return shouldSend;
  }

  private static isValidKey(key: string): boolean {
    const regex = new RegExp(KEY_REGEX);
    return !!key && regex.test(key);
  }

  private static isValidValue(value: string): boolean {
    return !!value;
  }
}
