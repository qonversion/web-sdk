import {InternalConfig} from '../../src/internal/InternalConfig';
import {QonversionInternal} from '../../src/internal/QonversionInternal';
import {DependenciesAssembly} from '../../src/internal/di/DependenciesAssembly';
import {LoggerConfig, NetworkConfig, PrimaryConfig} from '../../src/types';
import Qonversion, {
  Entitlement,
  Environment,
  LaunchMode,
  LogLevel,
  PurchaseCoreData,
  StripeStoreData,
  UserProperty,
  UserPurchase,
} from '../../src';
import {UserPropertiesController, UserPropertiesControllerImpl} from '../../src/internal/userProperties';
import {UserController} from '../../src/internal/user';
import {EntitlementsController} from '../../src/internal/entitlements';
import {EntitlementsControllerImpl} from '../../src/internal/entitlements/EntitlementsController';
import {PurchasesController} from '../../src/internal/purchases';
import {PurchasesControllerImpl} from '../../src/internal/purchases/PurchasesController';

jest.mock('../../src/internal/di/DependenciesAssembly', () => {
  const originalModule = jest.requireActual('../../src/internal/di/DependenciesAssembly');
  return {__esModule: true, ...originalModule};
});

let primaryConfig: PrimaryConfig;
let networkConfig: NetworkConfig;
let loggerConfig: LoggerConfig;
let internalConfig: InternalConfig;
let userPropertyController: UserPropertiesController;
let userController: UserController;
let entitlementsController: EntitlementsController;
let purchasesController: PurchasesController;
let dependenciesAssembly: jest.Mocked<DependenciesAssembly>;
let qonversionInternal: QonversionInternal;

beforeEach(() => {
  primaryConfig = {
    environment: Environment.Sandbox,
    launchMode: LaunchMode.InfrastructureMode,
    projectKey: '',
    sdkVersion: '',
  };
  networkConfig = {
    canSendRequests: true,
  };
  loggerConfig = {
    logTag: '',
    logLevel: LogLevel.Warning,
  };
  internalConfig = new InternalConfig({
    primaryConfig,
    networkConfig,
    loggerConfig,
  });
  userPropertyController = new (UserPropertiesControllerImpl as any)();
  entitlementsController = new (EntitlementsControllerImpl as any)();
  purchasesController = new (PurchasesControllerImpl as any)();
  // @ts-ignore
  userController = {};
  dependenciesAssembly = new (DependenciesAssembly as any)();
  dependenciesAssembly.userPropertiesController = jest.fn(() => userPropertyController);
  dependenciesAssembly.userController = jest.fn(() => userController);
  dependenciesAssembly.entitlementsController = jest.fn(() => entitlementsController);
  dependenciesAssembly.purchasesController = jest.fn(() => purchasesController);
  qonversionInternal = new QonversionInternal(internalConfig, dependenciesAssembly);
});

describe('setters tests', function () {
  test('set environment', () => {
    // given
    const environment = Environment.Sandbox;
    const expPrimaryConfig = {...primaryConfig, environment};

    // when
    qonversionInternal.setEnvironment(environment);

    // then
    expect(internalConfig.primaryConfig).toStrictEqual(expPrimaryConfig);
  });

  test('set log level', () => {
    // given
    const logLevel = LogLevel.Error;
    const expLoggerConfig = {...loggerConfig, logLevel};

    // when
    qonversionInternal.setLogLevel(logLevel);

    // then
    expect(internalConfig.loggerConfig).toStrictEqual(expLoggerConfig);
  });

  test('set log tag', () => {
    // given
    const logTag = 'New log tag';
    const expLoggerConfig = {...loggerConfig, logTag};

    // when
    qonversionInternal.setLogTag(logTag);

    // then
    expect(internalConfig.loggerConfig).toStrictEqual(expLoggerConfig);
  });
});

describe('finish tests', function () {
  beforeEach(() => {
    qonversionInternal = new QonversionInternal(internalConfig, dependenciesAssembly);
  });

  test('finish current shared instance', () => {
    // given
    Qonversion['backingInstance'] = qonversionInternal;

    // when
    qonversionInternal.finish();

    // then
    expect(Qonversion['backingInstance']).toBeUndefined();
  });

  test('finish not shared instance', () => {
    // given
    const anotherInstance = new QonversionInternal(internalConfig, dependenciesAssembly);
    Qonversion['backingInstance'] = anotherInstance;

    // when
    qonversionInternal.finish();

    // then
    expect(Qonversion['backingInstance']).toBe(anotherInstance);
  });
});

describe('UserController usage tests', () => {
  test('identify', () => {
    // given
    const identityId = 'test identity id';
    const promiseReturned = new Promise<void>(() => {});
    userController.identify = jest.fn(async () => promiseReturned);

    // when
    const res = qonversionInternal.identify(identityId);

    // then
    expect(res).toStrictEqual(promiseReturned);
    expect(userController.identify).toBeCalledWith(identityId);
  });

  test('logout', () => {
    // given
    const promiseReturned = new Promise<void>(() => {});
    userController.logout = jest.fn(async () => promiseReturned);

    // when
    const res = qonversionInternal.logout();

    // then
    expect(res).toStrictEqual(promiseReturned);
    expect(userController.logout).toBeCalled();
  });
});

describe('UserPropertiesController usage tests', () => {
  test('setCustomUserProperty', () => {
    // given
    const key = 'property_key';
    const value = 'property_value';
    userPropertyController.setProperty = jest.fn();

    // when
    qonversionInternal.setCustomUserProperty(key, value);

    // then
    expect(userPropertyController.setProperty).toBeCalledWith(key, value);
  });

  test('setUserProperty', () => {
    // given
    const key = UserProperty.AppsFlyerUserId;
    const value = 'property_value';
    userPropertyController.setProperty = jest.fn();

    // when
    qonversionInternal.setUserProperty(key, value);

    // then
    expect(userPropertyController.setProperty).toBeCalledWith(key, value);
  });

  test('setUserProperties', () => {
    // given
    const properties = {
      key: 'value',
      a: 'aa',
      b: 'bb',
    };
    userPropertyController.setProperties = jest.fn();

    // when
    qonversionInternal.setUserProperties(properties);

    // then
    expect(userPropertyController.setProperties).toBeCalledWith(properties);
  });
});

describe('EntitlementsController usage tests', () => {
  test('getEntitlements', () => {
    // given
    const promiseReturned = new Promise<Entitlement[]>(() => []);
    entitlementsController.getEntitlements = jest.fn(async () => promiseReturned);

    // when
    const res = qonversionInternal.getEntitlements();

    // then
    expect(res).toStrictEqual(promiseReturned);
    expect(entitlementsController.getEntitlements).toBeCalled();
  });
});

describe('PurchasesController usage tests', () => {
  test('sendStripePurchase',
    () => {
      // given
      const responseData: UserPurchase = {
        currency: 'USD',
        price: 10,
        purchasedAt: 934590234,
        stripeStoreData: {
          productId: 'test product id',
          subscriptionId: 'test subscription id',
        },
      };
      const requestData: PurchaseCoreData & StripeStoreData = {
        currency: 'USD',
        price: 10,
        purchasedAt: 934590234,
        productId: 'test product id',
        subscriptionId: 'test subscription id',
      };
      const promiseReturned = new Promise<UserPurchase>(() => responseData);
      purchasesController.sendStripePurchase = jest.fn(async () => promiseReturned);

      // when
      const res = qonversionInternal.sendStripePurchase(requestData);

      // then
      expect(res).toStrictEqual(promiseReturned);
      expect(purchasesController.sendStripePurchase).toBeCalledWith(requestData);
    });
});
