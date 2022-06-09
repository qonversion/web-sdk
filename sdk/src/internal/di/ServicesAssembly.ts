import {INetworkAssembly, IServicesAssembly} from './types';
import {UserPropertiesService, UserPropertiesServiceImpl} from '../userProperties';

export class ServicesAssembly implements IServicesAssembly {
  private readonly networkAssembly: INetworkAssembly;

  constructor(networkAssembly: INetworkAssembly) {
    this.networkAssembly = networkAssembly;
  }

  userPropertiesService(): UserPropertiesService {
    return new UserPropertiesServiceImpl(
      this.networkAssembly.requestConfigurator(),
      this.networkAssembly.infiniteExponentialApiInteractor(),
    );
  }
}
