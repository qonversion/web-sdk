import {ILogger} from '../logger';
import {IApiInteractor, IHeaderBuilder, INetworkClient, IRequestConfigurator, RetryDelayCalculator} from '../network';
import {IUserDataProvider} from '../user';
import {LocalStorage} from '../common';
import {UserPropertiesService, UserPropertiesStorage} from '../userProperties';

export type IMiscAssembly = {
  logger: () => ILogger;
  exponentialDelayCalculator: () => RetryDelayCalculator;
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
};

export type IControllersAssembly = {

};

export type IStorageAssembly = {
  localStorage: () => LocalStorage;
  userDataProvider: () => IUserDataProvider;
  sentUserPropertiesStorage: () => UserPropertiesStorage;
  pendingUserPropertiesStorage: () => UserPropertiesStorage;
};
