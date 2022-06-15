import {IdentityService, UserController, UserDataStorage, UserIdGenerator, UserService} from './types';
import {User} from '../../dto/User';
import {ILogger} from '../logger';
import {TEST_USER_ID} from './constants';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

export class UserControllerImpl implements UserController {
  private readonly userService: UserService;
  private readonly identityService: IdentityService;
  private readonly userDataStorage: UserDataStorage;
  private readonly userIdGenerator: UserIdGenerator;
  private readonly logger: ILogger;

  constructor(
    userService: UserService,
    identityService: IdentityService,
    userDataStorage: UserDataStorage,
    userIdGenerator: UserIdGenerator,
    logger: ILogger
  ) {
    this.userService = userService;
    this.identityService = identityService;
    this.userDataStorage = userDataStorage;
    this.userIdGenerator = userIdGenerator;
    this.logger = logger;

    const existingUserId = userDataStorage.getUserId();
    if (!existingUserId || existingUserId == TEST_USER_ID) {
      this.createUser()
        .then(() => this.logger.info('New user created on initialization'))
        .catch(error => this.logger.error('Failed to create new user on initialization', error));
    }
  }

  async getUser(): Promise<User> {
    try {
      const userId = this.userDataStorage.requireUserId();
      const apiUser = await this.userService.getUser(userId);
      this.logger.info('User info was successfully received from API')
      return apiUser;
    } catch (error) {
      this.logger.error('Failed to get User from API', error)
      throw error;
    }
  }

  async identify(identityId: string): Promise<void> {
    if (identityId == this.userDataStorage.getIdentityUserId()) {
      return;
    }

    try {
      const newOriginalId = await this.identityService.obtainIdentity(identityId);
      this.handleSuccessfulIdentity(newOriginalId, identityId);
    } catch (error) {
      if (error instanceof QonversionError && error.code == QonversionErrorCode.IdentityNotFound) {
        const originalId = this.userDataStorage.requireUserId();

        try {
          const newOriginalId = await this.identityService.createIdentity(originalId, identityId);
          this.handleSuccessfulIdentity(newOriginalId, identityId);
        } catch (secondaryError) {
          this.logger.error(`Failed to create user identity for id ${identityId}`, secondaryError);
          throw secondaryError;
        }
      } else {
        this.logger.error(`Failed to identify user with id ${identityId}`, error)
        throw error;
      }
    }
  }

  async logout(): Promise<void> {
    if (!this.userDataStorage.getIdentityUserId()) {
      return;
    }

    try {
      await this.createUser();
      this.logger.info('Logout is completed. A new user is successfully created.');
    } catch (error) {
      this.logger.error('Failed to create new user after logout.', error);
      throw error;
    }
  }

  private async createUser(): Promise<User> {
    this.userDataStorage.clearIdentityUserId();
    const newOriginalId = this.userIdGenerator.generate();
    this.userDataStorage.setOriginalUserId(newOriginalId);

    return this.userService.createUser(newOriginalId);
  }

  private handleSuccessfulIdentity(originalId: string, identityId: string) {
      this.logger.info(`User with id ${identityId} is successfully identified.`);

    this.userDataStorage.setOriginalUserId(originalId);
    this.userDataStorage.setIdentityUserId(identityId);
  }
}
