import {ControllersAssembly, MiscAssembly, NetworkAssembly, ServicesAssembly, StorageAssembly} from './types';
import {InternalConfig} from '../InternalConfig';
import {MiscAssemblyImpl} from './MiscAssembly';
import {NetworkAssemblyImpl} from './NetworkAssembly';
import {ServicesAssemblyImpl} from './ServicesAssembly';
import {ControllersAssemblyImpl} from './ControllersAssembly';
import {StorageAssemblyImpl} from './StorageAssembly';
import {ApiInteractor, HeaderBuilder, NetworkClient, RequestConfigurator, RetryDelayCalculator} from '../network';
import {
  IdentityService,
  UserDataProvider,
  UserController,
  UserDataStorage,
  UserIdGenerator,
  UserService,
} from '../user';
import {Logger} from '../logger';
import {LocalStorage} from '../common';
import {UserPropertiesController, UserPropertiesService, UserPropertiesStorage} from '../userProperties';
import {DelayedWorker} from '../utils/DelayedWorker';
import {EntitlementsController, EntitlementsService} from '../entitlements';
import {PurchasesController, PurchasesService} from '../purchases';

export class DependenciesAssembly implements MiscAssembly, NetworkAssembly, ServicesAssembly, ControllersAssembly, StorageAssembly {
  private readonly networkAssembly: NetworkAssembly;
  private readonly miscAssembly: MiscAssembly;
  private readonly servicesAssembly: ServicesAssembly;
  private readonly controllersAssembly: ControllersAssembly;
  private readonly storageAssembly: StorageAssembly;

  constructor(
    networkAssembly: NetworkAssembly,
    miscAssembly: MiscAssembly,
    servicesAssembly: ServicesAssembly,
    controllersAssembly: ControllersAssembly,
    storageAssembly: StorageAssembly,
  ) {
    this.networkAssembly = networkAssembly;
    this.miscAssembly = miscAssembly;
    this.servicesAssembly = servicesAssembly;
    this.controllersAssembly = controllersAssembly;
    this.storageAssembly = storageAssembly;
  };

  logger(): Logger {
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

  exponentialApiInteractor(): ApiInteractor {
    return this.networkAssembly.exponentialApiInteractor();
  }

  infiniteExponentialApiInteractor(): ApiInteractor {
    return this.networkAssembly.infiniteExponentialApiInteractor();
  }

  headerBuilder(): HeaderBuilder {
    return this.networkAssembly.headerBuilder();
  }

  networkClient(): NetworkClient {
    return this.networkAssembly.networkClient();
  }

  requestConfigurator(): RequestConfigurator {
    return this.networkAssembly.requestConfigurator();
  }

  localStorage(): LocalStorage {
    return this.storageAssembly.localStorage();
  }

  userDataProvider(): UserDataProvider {
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

  purchasesService(): PurchasesService {
    return this.servicesAssembly.purchasesService();
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

  purchasesController(): PurchasesController {
    return this.controllersAssembly.purchasesController();
  }
}

export class DependenciesAssemblyBuilder {
  private readonly internalConfig: InternalConfig;

  constructor(internalConfig: InternalConfig) {
    this.internalConfig = internalConfig;
  };

  build(): DependenciesAssembly {
    const miscAssembly = new MiscAssemblyImpl(this.internalConfig);
    const storageAssembly = new StorageAssemblyImpl();
    const networkAssembly = new NetworkAssemblyImpl(this.internalConfig, storageAssembly, miscAssembly);
    const servicesAssembly = new ServicesAssemblyImpl(networkAssembly);
    const controllersAssembly = new ControllersAssemblyImpl(miscAssembly, storageAssembly, servicesAssembly);

    return new DependenciesAssembly(
      networkAssembly, miscAssembly, servicesAssembly, controllersAssembly, storageAssembly
    );
  };
}
