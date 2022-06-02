import {InternalConfig} from '../../src/internal/InternalConfig';
import {QonversionInternal} from '../../src/internal/QonversionInternal';
import {DependenciesAssembly} from '../../src/internal/di/DependenciesAssembly';
import {LoggerConfig, NetworkConfig, PrimaryConfig} from '../../src/types';
import Qonversion, {CacheLifetime, Environment, LaunchMode, LogLevel} from '../../src';

jest.mock('../../src/internal/di/DependenciesAssembly', () => {
  const originalModule = jest.requireActual('../../src/internal/di/DependenciesAssembly');
  return {__esModule: true, ...originalModule};
});

let primaryConfig: PrimaryConfig = {
  environment: Environment.Sandbox,
  launchMode: LaunchMode.InfrastructureMode,
  projectKey: '',
  sdkVersion: '',
};
let networkConfig: NetworkConfig = {
  canSendRequests: true,
};
let loggerConfig: LoggerConfig = {
  logTag: '',
  logLevel: LogLevel.Warning,
};
let internalConfig: InternalConfig = new InternalConfig({
  primaryConfig,
  networkConfig,
  loggerConfig,
  cacheLifetime: CacheLifetime.Week,
});
let dependenciesAssembly: jest.Mocked<DependenciesAssembly> = new (DependenciesAssembly as any)();
let qonversionInternal: QonversionInternal;

describe('setters tests', function () {
  beforeEach(() => {
    qonversionInternal = new QonversionInternal(internalConfig, dependenciesAssembly);
  });

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
