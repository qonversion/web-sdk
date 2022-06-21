import {ILogger} from '../logger';
import {IApiInteractor, IHeaderBuilder, INetworkClient, IRequestConfigurator, RetryDelayCalculator} from '../network';
import {
  IdentityService,
  IUserDataProvider,
  UserController,
  UserDataStorage,
  UserIdGenerator,
  UserService
} from '../user';
import {LocalStorage} from '../common';
import {UserPropertiesController, UserPropertiesService, UserPropertiesStorage} from '../userProperties';
import {DelayedWorker} from '../utils/DelayedWorker';
import {EntitlementsController, EntitlementsService} from '../entitlements';
import {PurchasesController, PurchasesService} from '../purchases';

export type IMiscAssembly = {
  logger: () => ILogger;
  exponentialDelayCalculator: () => RetryDelayCalculator;
  delayedWorker: () => DelayedWorker;
  userIdGenerator: () => UserIdGenerator;
};

export type INetworkAssembly = {
  networkClient: () => INetworkClient;
  requestConfigurator: () => IRequestConfigurator;
  headerBuilder: () => IHeaderBuilder;
  exponentialApiInteractor: () => IApiInteractor;
  infiniteExponentialApiInteractor: () => IApiInteractor;
};

export type IServicesAssembly = {
  userPropertiesService: () => UserPropertiesService;
  userService: () => UserService;
  userServiceDecorator: () => UserService;
  identityService: () => IdentityService;
  entitlementsService: () => EntitlementsService;
  purchasesService: () => PurchasesService;
};

export type IControllersAssembly = {
  userPropertiesController: () => UserPropertiesController;
  userController: () => UserController;
  entitlementsController: () => EntitlementsController;
  purchasesController: () => PurchasesController;
};

export type IStorageAssembly = {
  localStorage: () => LocalStorage;
  sentUserPropertiesStorage: () => UserPropertiesStorage;
  pendingUserPropertiesStorage: () => UserPropertiesStorage;
  userDataProvider: () => IUserDataProvider;
  userDataStorage: () => UserDataStorage;
};
