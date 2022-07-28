import {QonversionInstance} from '../types';
import {InternalConfig} from './InternalConfig';
import {LogLevel} from '../dto/LogLevel';
import {Environment} from '../dto/Environment';
import {DependenciesAssembly} from './di/DependenciesAssembly';
import Qonversion from '../Qonversion';
import {UserProperty} from '../dto/UserProperty';
import {UserPropertiesController} from './userProperties';
import {UserController} from './user';
import {EntitlementsController} from './entitlements';
import {Entitlement} from '../dto/Entitlement';
import {PurchasesController} from './purchases';
import {PurchaseCoreData, StripeStoreData, UserPurchase} from '../dto/Purchase';
import {Logger} from './logger';

export class QonversionInternal implements QonversionInstance {
  private readonly internalConfig: InternalConfig;
  private readonly userPropertiesController: UserPropertiesController;
  private readonly userController: UserController;
  private readonly entitlementsController: EntitlementsController;
  private readonly purchasesController: PurchasesController;
  private readonly logger: Logger;

  constructor(internalConfig: InternalConfig, dependenciesAssembly: DependenciesAssembly) {
    this.internalConfig = internalConfig;

    this.userPropertiesController = dependenciesAssembly.userPropertiesController();
    this.userController = dependenciesAssembly.userController();
    this.entitlementsController = dependenciesAssembly.entitlementsController();
    this.purchasesController = dependenciesAssembly.purchasesController();
    this.logger = dependenciesAssembly.logger();

    this.logger.verbose("The QonversionInstance is created");
  }

  sendStripePurchase(data: PurchaseCoreData & StripeStoreData): Promise<UserPurchase> {
    this.logger.verbose("sendStripePurchase() call");
    return this.purchasesController.sendStripePurchase(data);
  }

  getEntitlements(): Promise<Entitlement[]> {
    this.logger.verbose("getEntitlements() call");
    return this.entitlementsController.getEntitlements();
  }

  identify(userId: string): Promise<void> {
    this.logger.verbose("identify() call");
    return this.userController.identify(userId);
  }

  logout(): Promise<void> {
    this.logger.verbose("logout() call");
    return this.userController.logout();
  }

  setCustomUserProperty(key: string, value: string): void {
    this.logger.verbose("setCustomUserProperty() call");
    this.userPropertiesController.setProperty(key, value);
  }

  setUserProperties(userProperties: Record<string, string>): void {
    this.logger.verbose("setUserProperties() call");
    this.userPropertiesController.setProperties(userProperties);
  }

  setUserProperty(property: UserProperty, value: string): void {
    this.logger.verbose("setUserProperty() call");
    this.userPropertiesController.setProperty(property, value);
  }

  finish() {
    this.logger.verbose("finish() call");

    if (Qonversion["backingInstance"] == this) {
      Qonversion["backingInstance"] = undefined
    }
  }

  setEnvironment(environment: Environment) {
    this.logger.verbose("setEnvironment() call");
    this.internalConfig.primaryConfig = {...this.internalConfig.primaryConfig, environment};
  }

  setLogLevel(logLevel: LogLevel) {
    this.logger.verbose("setLogLevel() call");
    this.internalConfig.loggerConfig = {...this.internalConfig.loggerConfig, logLevel};
  }

  setLogTag(logTag: string) {
    this.logger.verbose("setLogTag() call");
    this.internalConfig.loggerConfig = {...this.internalConfig.loggerConfig, logTag};
  }
}
