import {IMiscAssembly, INetworkAssembly, IStorageAssembly} from './types';
import {
  API_URL,
  ApiInteractor,
  HeaderBuilder,
  IApiInteractor,
  IHeaderBuilder,
  INetworkClient,
  IRequestConfigurator,
  NetworkClient,
  RequestConfigurator,
  RetryPolicy,
  RetryPolicyExponential,
  RetryPolicyInfiniteExponential,
} from '../network';
import {InternalConfig} from '../InternalConfig';

export class NetworkAssembly implements INetworkAssembly {
  private readonly internalConfig: InternalConfig;
  private readonly storageAssembly: IStorageAssembly;
  private readonly miscAssembly: IMiscAssembly;

  constructor(internalConfig: InternalConfig, storageAssembly: IStorageAssembly, miscAssembly: IMiscAssembly) {
    this.internalConfig = internalConfig;
    this.storageAssembly = storageAssembly;
    this.miscAssembly = miscAssembly;
  }

  networkClient(): INetworkClient {
    return new NetworkClient();
  }

  requestConfigurator(): IRequestConfigurator {
    return new RequestConfigurator(
      this.headerBuilder(),
      API_URL,
      this.internalConfig,
      this.storageAssembly.userDataProvider(),
    );
  }

  headerBuilder(): IHeaderBuilder {
    return new HeaderBuilder(
      this.internalConfig,
      this.internalConfig,
      this.storageAssembly.userDataProvider(),
    );
  }

  exponentialApiInteractor(): IApiInteractor {
    return this.apiInteractor(new RetryPolicyExponential());
  }

  infiniteExponentialApiInteractor(): IApiInteractor {
    return this.apiInteractor(new RetryPolicyInfiniteExponential());
  }

  private apiInteractor(retryPolicy: RetryPolicy): IApiInteractor {
    return new ApiInteractor(
      this.networkClient(),
      this.miscAssembly.exponentialDelayCalculator(),
      this.internalConfig,
      retryPolicy,
    );
  }
}
