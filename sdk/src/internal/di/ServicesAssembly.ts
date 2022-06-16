import {NetworkAssembly, ServicesAssembly} from './types';
import {UserPropertiesService, UserPropertiesServiceImpl} from '../userProperties';
import {IdentityService, IdentityServiceImpl, UserService, UserServiceDecorator, UserServiceImpl} from '../user';
import {EntitlementsService, EntitlementsServiceImpl} from '../entitlements';
import {PurchaseServiceImpl, PurchasesService} from '../purchases';

export class ServicesAssemblyImpl implements ServicesAssembly {
  private readonly networkAssembly: NetworkAssembly;

  constructor(networkAssembly: NetworkAssembly) {
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

  entitlementsService(): EntitlementsService {
    return new EntitlementsServiceImpl(
      this.networkAssembly.requestConfigurator(),
      this.networkAssembly.exponentialApiInteractor(),
    );
  }

  purchasesService(): PurchasesService {
    return new PurchaseServiceImpl(
      this.networkAssembly.requestConfigurator(),
      this.networkAssembly.exponentialApiInteractor(),
    );
  }
}
