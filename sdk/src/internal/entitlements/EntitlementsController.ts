import {EntitlementsController, EntitlementsService} from './types';
import {Entitlement} from '../../dto/Entitlement';
import {UserController, UserDataStorage} from '../user';
import {ILogger} from '../logger';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

export class EntitlementsControllerImpl implements EntitlementsController {
  private readonly userController: UserController;
  private readonly entitlementsService: EntitlementsService;
  private readonly userDataStorage: UserDataStorage;
  private readonly logger: ILogger;

  constructor(userController: UserController, entitlementsService: EntitlementsService, userDataStorage: UserDataStorage, logger: ILogger) {
    this.userController = userController;
    this.entitlementsService = entitlementsService;
    this.userDataStorage = userDataStorage;
    this.logger = logger;
  }

  async getEntitlements(): Promise<Entitlement[]> {
    try {
      const userId = this.userDataStorage.requireUserId();
      const entitlements = await this.entitlementsService.getEntitlements(userId);
      this.logger.info('Successfully received entitlements', entitlements);
      return entitlements;
    } catch (error) {
      if (error instanceof QonversionError && error.code == QonversionErrorCode.UserNotFound) {
        try {
          this.logger.info('User is not registered. Creating new one');
          await this.userController.createUser();
        } catch (userCreationError) {
          this.logger.error('Failed to create new user', error);
        }
        return [];
      } else {
        this.logger.error('Failed to request entitlements', error);
        throw error;
      }
    }
  }
}