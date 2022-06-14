import {ILogger} from '../logger';
import {IApiInteractor, IHeaderBuilder, INetworkClient, IRequestConfigurator, RetryDelayCalculator} from '../network';
import {IUserDataProvider} from '../user';

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

};

export type IControllersAssembly = {

};

export type IStorageAssembly = {
  userDataProvider: () => IUserDataProvider;
};
