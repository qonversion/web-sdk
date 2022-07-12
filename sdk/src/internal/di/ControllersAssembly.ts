import {ControllersAssembly, MiscAssembly, ServicesAssembly, StorageAssembly} from './types';
import {UserPropertiesController, UserPropertiesControllerImpl} from '../userProperties';
import {UserController, UserControllerImpl} from '../user';
import {EntitlementsController, EntitlementsControllerImpl} from '../entitlements';
import {PurchasesController, PurchasesControllerImpl} from '../purchases';

export class ControllersAssemblyImpl implements ControllersAssembly {
  private readonly miscAssembly: MiscAssembly;
  private readonly storageAssembly: StorageAssembly;
  private readonly servicesAssembly: ServicesAssembly;

  private sharedUserController: UserController | undefined;

  constructor(miscAssembly: MiscAssembly, storageAssembly: StorageAssembly, servicesAssembly: ServicesAssembly) {
    this.miscAssembly = miscAssembly;
    this.storageAssembly = storageAssembly;
    this.servicesAssembly = servicesAssembly;
  }

  userPropertiesController(): UserPropertiesController {
    return new UserPropertiesControllerImpl(
      this.storageAssembly.pendingUserPropertiesStorage(),
      this.storageAssembly.sentUserPropertiesStorage(),
      this.servicesAssembly.userPropertiesService(),
      this.miscAssembly.delayedWorker(),
      this.miscAssembly.logger(),
      this.userController(),
    );
  }

  userController(): UserController {
    if (this.sharedUserController) {
      return this.sharedUserController;
    }

    this.sharedUserController = new UserControllerImpl(
      this.servicesAssembly.userServiceDecorator(),
      this.servicesAssembly.identityService(),
      this.storageAssembly.userDataStorage(),
      this.miscAssembly.userIdGenerator(),
      this.miscAssembly.logger(),
    );
    return this.sharedUserController;
  }

  entitlementsController(): EntitlementsController {
    return new EntitlementsControllerImpl(
      this.userController(),
      this.servicesAssembly.entitlementsService(),
      this.storageAssembly.userDataStorage(),
      this.miscAssembly.logger(),
    );
  }

  purchasesController(): PurchasesController {
    return new PurchasesControllerImpl(
      this.servicesAssembly.purchasesService(),
      this.storageAssembly.userDataStorage(),
      this.miscAssembly.logger(),
    );
  }
}
