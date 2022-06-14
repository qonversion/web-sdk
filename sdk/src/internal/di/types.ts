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
};

export type IControllersAssembly = {
  userPropertiesController: () => UserPropertiesController;
  userController: () => UserController;
};

export type IStorageAssembly = {
  localStorage: () => LocalStorage;
  sentUserPropertiesStorage: () => UserPropertiesStorage;
  pendingUserPropertiesStorage: () => UserPropertiesStorage;
  userDataProvider: () => IUserDataProvider;
  userDataStorage: () => UserDataStorage;
};
