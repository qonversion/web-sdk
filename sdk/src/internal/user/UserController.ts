import {IdentityService, UserController, UserDataStorage, UserIdGenerator, UserService} from './types';
import {User} from '../../dto/User';
import {Logger} from '../logger';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

export class UserControllerImpl implements UserController {
  private readonly userService: UserService;
  private readonly identityService: IdentityService;
  private readonly userDataStorage: UserDataStorage;
  private readonly userIdGenerator: UserIdGenerator;
  private readonly logger: Logger;

  constructor(
    userService: UserService,
    identityService: IdentityService,
    userDataStorage: UserDataStorage,
    userIdGenerator: UserIdGenerator,
    logger: Logger,
  ) {
    this.userService = userService;
    this.identityService = identityService;
    this.userDataStorage = userDataStorage;
    this.userIdGenerator = userIdGenerator;
    this.logger = logger;

    const existingUserId = userDataStorage.getOriginalUserId();
    if (!existingUserId) {
      this.createUser()
        .then(() => this.logger.info('New user created on initialization'))
        .catch(error => this.logger.error('Failed to create new user on initialization', error));
    }
  }

  async getUser(): Promise<User> {
    try {
      const userId = this.userDataStorage.requireOriginalUserId();
      this.logger.verbose('Sending user request', {userId});
      const apiUser = await this.userService.getUser(userId);
      this.logger.info('User info was successfully received from API', apiUser);
      return apiUser;
    } catch (error) {
      this.logger.error('Failed to get User from API', error)
      throw error;
    }
  }

  async identify(identityId: string): Promise<void> {
    if (identityId == this.userDataStorage.getIdentityUserId()) {
      this.logger.verbose('Current user has the same identity id', {identityId});
      return;
    }

    try {
      this.logger.verbose('Checking for existing user with the given identity id', {identityId});
      const newOriginalId = await this.identityService.obtainIdentity(identityId);
      this.handleSuccessfulIdentity(newOriginalId, identityId);
    } catch (error) {
      if (error instanceof QonversionError && error.code == QonversionErrorCode.IdentityNotFound) {
        const originalId = this.userDataStorage.requireOriginalUserId();

        try {
          this.logger.verbose('No user found with the given identity id, linking current one', {userId: originalId, identityId});
          const newOriginalId = await this.identityService.createIdentity(originalId, identityId);
          this.handleSuccessfulIdentity(newOriginalId, identityId);
        } catch (secondaryError) {
          this.logger.error(`Failed to create user identity for id ${identityId}`, secondaryError);
          throw secondaryError;
        }
      } else {
        this.logger.error(`Failed to identify user with id ${identityId}`, error);
        throw error;
      }
    }
  }

  async logout(): Promise<void> {
    if (!this.userDataStorage.getIdentityUserId()) {
      this.logger.verbose('No user is identified, no need to logout');
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

  async createUser(): Promise<User> {
    this.userDataStorage.clearIdentityUserId();
    const newOriginalId = this.userIdGenerator.generate();
    this.userDataStorage.setOriginalUserId(newOriginalId);

    this.logger.verbose('Creating new user', {userId: newOriginalId});
    return this.userService.createUser(newOriginalId);
  }

  private handleSuccessfulIdentity(originalId: string, identityId: string) {
    this.logger.info(`User with id ${identityId} is successfully identified.`);

    this.userDataStorage.setOriginalUserId(originalId);
    this.userDataStorage.setIdentityUserId(identityId);
  }
}
