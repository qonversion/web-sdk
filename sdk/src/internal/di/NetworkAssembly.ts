import {MiscAssembly, NetworkAssembly, StorageAssembly} from './types';
import {
  ApiInteractorImpl,
  HeaderBuilderImpl,
  ApiInteractor,
  HeaderBuilder,
  NetworkClient,
  RequestConfigurator,
  NetworkClientImpl,
  RequestConfiguratorImpl,
  RetryPolicy,
  RetryPolicyExponential,
  RetryPolicyInfiniteExponential,
} from '../network';
import {InternalConfig} from '../InternalConfig';

export class NetworkAssemblyImpl implements NetworkAssembly {
  private readonly internalConfig: InternalConfig;
  private readonly storageAssembly: StorageAssembly;
  private readonly miscAssembly: MiscAssembly;

  constructor(internalConfig: InternalConfig, storageAssembly: StorageAssembly, miscAssembly: MiscAssembly) {
    this.internalConfig = internalConfig;
    this.storageAssembly = storageAssembly;
    this.miscAssembly = miscAssembly;
  }

  networkClient(): NetworkClient {
    return new NetworkClientImpl();
  }

  requestConfigurator(): RequestConfigurator {
    return new RequestConfiguratorImpl(
      this.headerBuilder(),
      this.internalConfig.networkConfig.apiUrl,
      this.internalConfig,
      this.storageAssembly.userDataProvider()
    );
  }

  headerBuilder(): HeaderBuilder {
    return new HeaderBuilderImpl(
      this.internalConfig,
      this.internalConfig,
      this.storageAssembly.userDataProvider(),
    );
  }

  exponentialApiInteractor(): ApiInteractor {
    return this.apiInteractor(new RetryPolicyExponential());
  }

  infiniteExponentialApiInteractor(): ApiInteractor {
    return this.apiInteractor(new RetryPolicyInfiniteExponential());
  }

  private apiInteractor(retryPolicy: RetryPolicy): ApiInteractor {
    return new ApiInteractorImpl(
      this.networkClient(),
      this.miscAssembly.exponentialDelayCalculator(),
      this.internalConfig,
      retryPolicy,
    );
  }
}
