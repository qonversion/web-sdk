import {QonversionInternal, InternalConfig} from '../../internal';
import {DependenciesAssembly} from '../../internal/di/DependenciesAssembly';
import {LoggerConfig, NetworkConfig, PrimaryConfig} from '../../types';
import Qonversion, {
  Entitlement,
  Environment,
  LogLevel,
  PurchaseCoreData,
  StripeStoreData,
  UserPropertyKey,
  UserPurchase,
} from '../../index';
import {UserPropertiesController} from '../../internal/userProperties';
import {UserController} from '../../internal/user';
import {EntitlementsController, EntitlementsControllerImpl} from '../../internal/entitlements';
import {PurchasesController, PurchasesControllerImpl} from '../../internal/purchases';
import {Logger} from '../../internal/logger';
import {API_URL} from '../../internal/network';
import {UserProperties} from '../../dto/UserProperties';
import {UserProperty} from '../../dto/UserProperty';

jest.mock('../../internal/di/DependenciesAssembly', () => {
  const originalModule = jest.requireActual('../../internal/di/DependenciesAssembly');
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
let logger: Logger;
let qonversionInternal: QonversionInternal;

beforeEach(() => {
  primaryConfig = {
    environment: Environment.Sandbox,
    projectKey: '',
    sdkVersion: '',
  };
  networkConfig = {
    canSendRequests: true,
    apiUrl: API_URL,
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
  // @ts-ignore
  userPropertyController = {};
  entitlementsController = new (EntitlementsControllerImpl as any)();
  purchasesController = new (PurchasesControllerImpl as any)();
  // @ts-ignore
  logger = {
    verbose: jest.fn(),
  }
  // @ts-ignore
  userController = {};
  dependenciesAssembly = new (DependenciesAssembly as any)();
  dependenciesAssembly.userPropertiesController = jest.fn(() => userPropertyController);
  dependenciesAssembly.userController = jest.fn(() => userController);
  dependenciesAssembly.entitlementsController = jest.fn(() => entitlementsController);
  dependenciesAssembly.purchasesController = jest.fn(() => purchasesController);
  dependenciesAssembly.logger = jest.fn(() => logger);
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
    expect(logger.verbose).toBeCalledWith('setEnvironment() call');
  });

  test('set log level', () => {
    // given
    const logLevel = LogLevel.Error;
    const expLoggerConfig = {...loggerConfig, logLevel};

    // when
    qonversionInternal.setLogLevel(logLevel);

    // then
    expect(internalConfig.loggerConfig).toStrictEqual(expLoggerConfig);
    expect(logger.verbose).toBeCalledWith('setLogLevel() call');
  });

  test('set log tag', () => {
    // given
    const logTag = 'New log tag';
    const expLoggerConfig = {...loggerConfig, logTag};

    // when
    qonversionInternal.setLogTag(logTag);

    // then
    expect(internalConfig.loggerConfig).toStrictEqual(expLoggerConfig);
    expect(logger.verbose).toBeCalledWith('setLogTag() call');
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
    expect(logger.verbose).toBeCalledWith('finish() call');
  });

  test('finish not shared instance', () => {
    // given
    const anotherInstance = new QonversionInternal(internalConfig, dependenciesAssembly);
    Qonversion['backingInstance'] = anotherInstance;

    // when
    qonversionInternal.finish();

    // then
    expect(Qonversion['backingInstance']).toBe(anotherInstance);
    expect(logger.verbose).toBeCalledWith('finish() call');
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
    expect(logger.verbose).toBeCalledWith('identify() call');
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
    expect(logger.verbose).toBeCalledWith('logout() call');
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
    expect(logger.verbose).toBeCalledWith('setCustomUserProperty() call');
  });

  test('setUserProperty', () => {
    // given
    const key = UserPropertyKey.AppsFlyerUserId;
    const value = 'property_value';
    userPropertyController.setProperty = jest.fn();

    // when
    qonversionInternal.setUserProperty(key, value);

    // then
    expect(userPropertyController.setProperty).toBeCalledWith(key, value);
    expect(logger.verbose).toBeCalledWith('setUserProperty() call');
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
    expect(logger.verbose).toBeCalledWith('setUserProperties() call');
  });

  test('userProperties', async () => {
    // given
    const response = new UserProperties([new UserProperty('testKey', 'testValue')]);
    userPropertyController.getProperties = jest.fn(() => Promise.resolve(response));

    // when
    const res = await qonversionInternal.userProperties();

    // then
    expect(res).toEqual(response);
    expect(userPropertyController.getProperties).toBeCalledWith();
    expect(logger.verbose).toBeCalledWith('userProperties() call');
  });
});

describe('EntitlementsController usage tests', () => {
  test('entitlements', () => {
    // given
    const promiseReturned = new Promise<Entitlement[]>(() => []);
    entitlementsController.getEntitlements = jest.fn(async () => promiseReturned);

    // when
    const res = qonversionInternal.entitlements();

    // then
    expect(res).toStrictEqual(promiseReturned);
    expect(entitlementsController.getEntitlements).toBeCalled();
    expect(logger.verbose).toBeCalledWith('entitlements() call');
  });
});

describe('PurchasesController usage tests', () => {
  test('sendStripePurchase',
    () => {
      // given
      const responseData: UserPurchase = {
        currency: 'USD',
        price: '10',
        purchased: 934590234,
        stripeStoreData: {
          productId: 'test product id',
          subscriptionId: 'test subscription id',
        },
        userId: 'Qon_test_user_id'
      };
      const requestData: PurchaseCoreData & StripeStoreData = {
        currency: 'USD',
        price: '10',
        purchased: 934590234,
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
      expect(logger.verbose).toBeCalledWith('sendStripePurchase() call');
    });
});
