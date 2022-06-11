import {UserPropertiesController, UserPropertiesService, UserPropertiesStorage} from './types';
import {DelayedWorker} from '../utils/DelayedWorker';
import {ILogger} from '../logger';
import {KEY_REGEX, SENDING_DELAY_MS} from './constants';
import {QonversionError} from '../../exception/QonversionError';

export class UserPropertiesControllerImpl implements UserPropertiesController {
  private readonly pendingUserPropertiesStorage: UserPropertiesStorage;
  private readonly sentUserPropertiesStorage: UserPropertiesStorage;
  private readonly userPropertiesService: UserPropertiesService;
  private readonly delayedWorker: DelayedWorker;
  private readonly logger: ILogger;
  private readonly sendingDelayMs: number;

  constructor(
    pendingUserPropertiesStorage: UserPropertiesStorage,
    sentUserPropertiesStorage: UserPropertiesStorage,
    userPropertiesService: UserPropertiesService,
    delayedWorker: DelayedWorker,
    logger: ILogger,
    sendingDelayMs: number = SENDING_DELAY_MS,
  ) {
    this.pendingUserPropertiesStorage = pendingUserPropertiesStorage;
    this.sentUserPropertiesStorage = sentUserPropertiesStorage;
    this.userPropertiesService = userPropertiesService;
    this.delayedWorker = delayedWorker;
    this.logger = logger;
    this.sendingDelayMs = sendingDelayMs;
  }

  setProperty(key: string, value: string): void {
    if (this.shouldSendProperty(key, value)) {
      this.pendingUserPropertiesStorage.addOne(key, value);
    }
    this.sendUserPropertiesIfNeeded();
  }

  setProperties(properties: Record<string, string>): void {
    const validatedProperties: Record<string, string> = {};
    Object.keys(properties).forEach(key => {
      if (this.shouldSendProperty(key, properties[key])) {
        validatedProperties[key] = properties[key];
      }
    });
    this.pendingUserPropertiesStorage.add(validatedProperties);
    this.sendUserPropertiesIfNeeded();
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
        return
      }
      const processedPropertyKeys = await this.userPropertiesService.sendProperties(propertiesToSend);

      const nonProcessedProperties: Record<string, string> = {};
      const processedProperties: Record<string, string> = {};
      Object.keys(propertiesToSend).forEach(key => {
        if (processedPropertyKeys.includes(key)) {
          processedProperties[key] = propertiesToSend[key];
        } else {
          nonProcessedProperties[key] = propertiesToSend[key];
        }
      });

      // We delete all sent properties even if they were not successfully handled
      // to prevent spamming api with unacceptable properties.
      this.pendingUserPropertiesStorage.delete(propertiesToSend);
      this.sentUserPropertiesStorage.add(processedProperties);

      const nonProcessedPropertyKeys = Object.keys(nonProcessedProperties);
      if (nonProcessedPropertyKeys.length > 0) {
        const joinedKeys = nonProcessedPropertyKeys.join(', ');
        this.logger.warn(`Some user properties were not processed: ${joinedKeys}.`);
      }

      this.sendUserPropertiesIfNeeded(true);
    } catch (e) {
      if (e instanceof QonversionError) {
        this.logger.error('Failed to send user properties to api', e);
      }
    }
  }

  private shouldSendProperty(key: string, value: string): boolean {
    let shouldSend = true;
    if (!UserPropertiesControllerImpl.isValidKey(key)) {
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
        `The same property with key: "${key}" and value: "${value}" ` +
        'was already sent for the current user. To avoid any confusion, it will not be sent again.'
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
