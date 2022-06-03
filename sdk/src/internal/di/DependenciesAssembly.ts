import {IControllersAssembly, IMiscAssembly, INetworkAssembly, IServicesAssembly} from './types';
import {InternalConfig} from '../InternalConfig';
import {MiscAssembly} from './MiscAssembly';
import {NetworkAssembly} from './NetworkAssembly';
import {ServicesAssembly} from './ServicesAssembly';
import {ControllersAssembly} from './ControllersAssembly';
import {ILogger} from '../logger/types';

export class DependenciesAssembly implements IMiscAssembly, INetworkAssembly, IServicesAssembly, IControllersAssembly {
  private readonly networkAssembly: INetworkAssembly;
  private readonly miscAssembly: IMiscAssembly;
  private readonly servicesAssembly: IServicesAssembly;
  private readonly controllersAssembly: IControllersAssembly;

  constructor(
    networkAssembly: INetworkAssembly,
    miscAssembly: IMiscAssembly,
    servicesAssembly: IServicesAssembly,
    controllersAssembly: IControllersAssembly
  ) {
    this.networkAssembly = networkAssembly;
    this.miscAssembly = miscAssembly;
    this.servicesAssembly = servicesAssembly;
    this.controllersAssembly = controllersAssembly;
  };

  logger(): ILogger {
    return this.miscAssembly.logger();
  }
}

export class DependenciesAssemblyBuilder {
  private readonly internalConfig: InternalConfig;

  constructor(internalConfig: InternalConfig) {
    this.internalConfig = internalConfig;
  };

  build(): DependenciesAssembly {
    const miscAssembly = new MiscAssembly(this.internalConfig);
    const networkAssembly = new NetworkAssembly();
    const servicesAssembly = new ServicesAssembly();
    const controllersAssembly = new ControllersAssembly();

    return new DependenciesAssembly(
      networkAssembly, miscAssembly, servicesAssembly, controllersAssembly
    );
  };
}
