import {INetworkAssembly, IServicesAssembly} from './types';
import {UserPropertiesService, UserPropertiesServiceImpl} from '../userProperties';
import {IdentityService, IdentityServiceImpl, UserService, UserServiceDecorator, UserServiceImpl} from '../user';

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

  userService(): UserService {
    return new UserServiceImpl(
      this.networkAssembly.requestConfigurator(),
      this.networkAssembly.exponentialApiInteractor(),
    );
  }

  userServiceDecorator(): UserService {
    return new UserServiceDecorator(
      this.userService(),
    );
  }

  identityService(): IdentityService {
    return new IdentityServiceImpl(
      this.networkAssembly.requestConfigurator(),
      this.networkAssembly.exponentialApiInteractor(),
    );
  }
}
