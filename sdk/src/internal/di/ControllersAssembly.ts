import {IControllersAssembly, IMiscAssembly, IServicesAssembly, IStorageAssembly} from './types';
import {UserPropertiesController, UserPropertiesControllerImpl} from '../userProperties';

export class ControllersAssembly implements IControllersAssembly {
  private readonly miscAssembly: IMiscAssembly;
  private readonly storageAssembly: IStorageAssembly;
  private readonly servicesAssembly: IServicesAssembly;

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
}
