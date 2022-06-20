import {InternalConfig} from '../../src/internal/InternalConfig';
import {QonversionInternal} from '../../src/internal/QonversionInternal';
import {DependenciesAssembly} from '../../src/internal/di/DependenciesAssembly';
import {LoggerConfig, NetworkConfig, PrimaryConfig} from '../../src/types';
import Qonversion, {Environment, LaunchMode, LogLevel, UserProperty} from '../../src';
import {UserPropertiesController, UserPropertiesControllerImpl} from '../../src/internal/userProperties';

jest.mock('../../src/internal/di/DependenciesAssembly', () => {
  const originalModule = jest.requireActual('../../src/internal/di/DependenciesAssembly');
  return {__esModule: true, ...originalModule};
});

let primaryConfig: PrimaryConfig;
let networkConfig: NetworkConfig;
let loggerConfig: LoggerConfig;
let internalConfig: InternalConfig;
let userPropertyController: UserPropertiesController;
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
  dependenciesAssembly = new (DependenciesAssembly as any)();
  dependenciesAssembly.userPropertiesController = jest.fn(() => userPropertyController);
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