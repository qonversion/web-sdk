import {IControllersAssembly, IMiscAssembly, IServicesAssembly, IStorageAssembly} from './types';
import {UserPropertiesController, UserPropertiesControllerImpl} from '../userProperties';
import {UserController, UserControllerImpl} from '../user';
import {EntitlementsController, EntitlementsControllerImpl} from '../entitlements';
import {PurchasesController, PurchasesControllerImpl} from '../purchases';

export class ControllersAssembly implements IControllersAssembly {
  private readonly miscAssembly: IMiscAssembly;
  private readonly storageAssembly: IStorageAssembly;
  private readonly servicesAssembly: IServicesAssembly;

  private sharedUserController: UserController | undefined;

  constructor(miscAssembly: IMiscAssembly, storageAssembly: IStorageAssembly, servicesAssembly: IServicesAssembly) {
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
