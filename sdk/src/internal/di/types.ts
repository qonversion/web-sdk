import {Logger} from '../logger';
import {ApiInteractor, HeaderBuilder, NetworkClient, RequestConfigurator, RetryDelayCalculator} from '../network';
import {
  IdentityService,
  UserDataProvider,
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

export type MiscAssembly = {
  logger: () => Logger;
  exponentialDelayCalculator: () => RetryDelayCalculator;
  delayedWorker: () => DelayedWorker;
  userIdGenerator: () => UserIdGenerator;
};

export type NetworkAssembly = {
  networkClient: () => NetworkClient;
  requestConfigurator: () => RequestConfigurator;
  headerBuilder: () => HeaderBuilder;
  exponentialApiInteractor: () => ApiInteractor;
  infiniteExponentialApiInteractor: () => ApiInteractor;
};

export type ServicesAssembly = {
  userPropertiesService: () => UserPropertiesService;
  userService: () => UserService;
  userServiceDecorator: () => UserService;
  identityService: () => IdentityService;
  entitlementsService: () => EntitlementsService;
  purchasesService: () => PurchasesService;
};

export type ControllersAssembly = {
  userPropertiesController: () => UserPropertiesController;
  userController: () => UserController;
  entitlementsController: () => EntitlementsController;
  purchasesController: () => PurchasesController;
};

export type StorageAssembly = {
  localStorage: () => LocalStorage;
  sentUserPropertiesStorage: () => UserPropertiesStorage;
  pendingUserPropertiesStorage: () => UserPropertiesStorage;
  userDataProvider: () => UserDataProvider;
  userDataStorage: () => UserDataStorage;
};
