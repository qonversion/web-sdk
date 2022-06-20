import {IControllersAssembly, IMiscAssembly, INetworkAssembly, IServicesAssembly, IStorageAssembly} from './types';
import {InternalConfig} from '../InternalConfig';
import {MiscAssembly} from './MiscAssembly';
import {NetworkAssembly} from './NetworkAssembly';
import {ServicesAssembly} from './ServicesAssembly';
import {ControllersAssembly} from './ControllersAssembly';
import {StorageAssembly} from './StorageAssembly';
import {IApiInteractor, IHeaderBuilder, INetworkClient, IRequestConfigurator, RetryDelayCalculator} from '../network';
import {
  IdentityService,
  IUserDataProvider,
  UserController,
  UserDataStorage,
  UserIdGenerator,
  UserService
} from '../user';
import {ILogger} from '../logger';
import {LocalStorage} from '../common';
import {UserPropertiesController, UserPropertiesService, UserPropertiesStorage} from '../userProperties';
import {DelayedWorker} from '../utils/DelayedWorker';
import {EntitlementsController, EntitlementsService} from '../entitlements';

export class DependenciesAssembly implements IMiscAssembly, INetworkAssembly, IServicesAssembly, IControllersAssembly, IStorageAssembly {
  private readonly networkAssembly: INetworkAssembly;
  private readonly miscAssembly: IMiscAssembly;
  private readonly servicesAssembly: IServicesAssembly;
  private readonly controllersAssembly: IControllersAssembly;
  private readonly storageAssembly: IStorageAssembly;

  constructor(
    networkAssembly: INetworkAssembly,
    miscAssembly: IMiscAssembly,
    servicesAssembly: IServicesAssembly,
    controllersAssembly: IControllersAssembly,
    storageAssembly: IStorageAssembly,
  ) {
    this.networkAssembly = networkAssembly;
    this.miscAssembly = miscAssembly;
    this.servicesAssembly = servicesAssembly;
    this.controllersAssembly = controllersAssembly;
    this.storageAssembly = storageAssembly;
  };

  logger(): ILogger {
    return this.miscAssembly.logger();
  }

  exponentialDelayCalculator(): RetryDelayCalculator {
    return this.miscAssembly.exponentialDelayCalculator();
  }

  delayedWorker(): DelayedWorker {
    return this.miscAssembly.delayedWorker();
  }

  userIdGenerator(): UserIdGenerator {
    return this.miscAssembly.userIdGenerator();
  }

  exponentialApiInteractor(): IApiInteractor {
    return this.networkAssembly.exponentialApiInteractor();
  }

  infiniteExponentialApiInteractor(): IApiInteractor {
    return this.networkAssembly.infiniteExponentialApiInteractor();
  }

  headerBuilder(): IHeaderBuilder {
    return this.networkAssembly.headerBuilder();
  }

  networkClient(): INetworkClient {
    return this.networkAssembly.networkClient();
  }

  requestConfigurator(): IRequestConfigurator {
    return this.networkAssembly.requestConfigurator();
  }

  localStorage(): LocalStorage {
    return this.storageAssembly.localStorage();
  }

  userDataProvider(): IUserDataProvider {
    return this.storageAssembly.userDataProvider();
  }

  userDataStorage(): UserDataStorage {
    return this.storageAssembly.userDataStorage();
  }

  sentUserPropertiesStorage(): UserPropertiesStorage {
    return this.storageAssembly.sentUserPropertiesStorage();
  }

  pendingUserPropertiesStorage(): UserPropertiesStorage {
    return this.storageAssembly.pendingUserPropertiesStorage();
  }

  userPropertiesService(): UserPropertiesService {
    return this.servicesAssembly.userPropertiesService();
  }

  userService(): UserService {
    return this.servicesAssembly.userService();
  }

  userServiceDecorator(): UserService {
    return this.servicesAssembly.userServiceDecorator();
  }

  identityService(): IdentityService {
    return this.servicesAssembly.identityService();
  }

  entitlementsService(): EntitlementsService {
    return this.servicesAssembly.entitlementsService();
  }

  userPropertiesController(): UserPropertiesController {
    return this.controllersAssembly.userPropertiesController();
  }

  userController(): UserController {
    return this.controllersAssembly.userController();
  }

  entitlementsController(): EntitlementsController {
    return this.controllersAssembly.entitlementsController();
  }
}

export class DependenciesAssemblyBuilder {
  private readonly internalConfig: InternalConfig;

  constructor(internalConfig: InternalConfig) {
    this.internalConfig = internalConfig;
  };

  build(): DependenciesAssembly {
    const miscAssembly = new MiscAssembly(this.internalConfig);
    const storageAssembly = new StorageAssembly();
    const networkAssembly = new NetworkAssembly(this.internalConfig, storageAssembly, miscAssembly);
    const servicesAssembly = new ServicesAssembly(networkAssembly);
    const controllersAssembly = new ControllersAssembly(miscAssembly, storageAssembly, servicesAssembly);

    return new DependenciesAssembly(
      networkAssembly, miscAssembly, servicesAssembly, controllersAssembly, storageAssembly
    );
  };
}
