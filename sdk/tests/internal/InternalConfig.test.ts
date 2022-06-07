import {LoggerConfig, NetworkConfig, PrimaryConfig, QonversionConfig} from '../../src/types';
import {Environment, LaunchMode, LogLevel} from '../../src';
import {InternalConfig} from '../../src/internal/InternalConfig';
import {
  EnvironmentProvider,
  LoggerConfigProvider,
  NetworkConfigHolder,
  PrimaryConfigProvider
} from '../../src/internal/types';

let primaryConfig: PrimaryConfig;
let networkConfig: NetworkConfig;
let loggerConfig: LoggerConfig;
let internalConfig: InternalConfig;

const canSendRequestsInitial = true;

beforeAll(() => {
  primaryConfig = {
    environment: Environment.Sandbox,
    launchMode: LaunchMode.InfrastructureMode,
    projectKey: '',
    sdkVersion: '',
  };

  networkConfig = {
    canSendRequests: canSendRequestsInitial,
  };

  loggerConfig = {
    logTag: '',
    logLevel: LogLevel.Warning,
  };
});

beforeEach(() => {
  const qonversionConfig: QonversionConfig = {loggerConfig, networkConfig, primaryConfig};
  internalConfig = new InternalConfig(qonversionConfig);
});

describe('EnvironmentProvider tests', () => {
  const projectKey = "projectKey";
  const launchMode = LaunchMode.InfrastructureMode;
  const environment = Environment.Sandbox;

  test('get environment', () => {
    // given
    internalConfig.primaryConfig = {projectKey, launchMode, environment, sdkVersion: ''};
    const environmentProvider: EnvironmentProvider = internalConfig;

    // when
    const resEnvironment = environmentProvider.getEnvironment();

    // then
    expect(resEnvironment).toBe(environment);
  });

  test('is sandbox when sandbox env', () => {
    // given
    internalConfig.primaryConfig = {projectKey, launchMode, environment: Environment.Sandbox, sdkVersion: ''};
    const environmentProvider: EnvironmentProvider = internalConfig;

    // when
    const isSandbox = environmentProvider.isSandbox();

    // then
    expect(isSandbox).toBeTruthy();
  });

  test('is not sandbox when prod env', () => {
    // given
    internalConfig.primaryConfig = {projectKey, launchMode, environment: Environment.Production, sdkVersion: ''};
    const environmentProvider: EnvironmentProvider = internalConfig;

    // when
    const isSandbox = environmentProvider.isSandbox();

    // then
    expect(isSandbox).toBeFalsy();
  });
});

describe('LoggerConfigProvider tests', () => {
  const logLevel = LogLevel.Warning;
  const logTag = 'logTag';
  const loggerConfig: LoggerConfig = {logLevel, logTag};

  test('get log level', () => {
    // given
    internalConfig.loggerConfig = loggerConfig;
    const loggerConfigProvider: LoggerConfigProvider = internalConfig;

    // when
    const resLogLevel = loggerConfigProvider.getLogLevel();

    // then
    expect(resLogLevel).toBe(logLevel);
  });

  test('get log tag', () => {
    // given
    internalConfig.loggerConfig = loggerConfig;
    const loggerConfigProvider: LoggerConfigProvider = internalConfig;

    // when
    const resLogTag = loggerConfigProvider.getLogTag();

    // then
    expect(resLogTag).toBe(logTag);
  });
});

describe('NetworkConfigHolder tests', () => {
  test('get can send requests', () => {
    // given
    const networkConfigHolder: NetworkConfigHolder = internalConfig;

    // when
    const canSendRequests = networkConfigHolder.canSendRequests();

    // then
    expect(canSendRequests).toBe(canSendRequestsInitial);
  });

  test('set can send requests', () => {
    // given
    const expCanSendRequests = false;
    const networkConfigHolder: NetworkConfigHolder = internalConfig;

    // when
    networkConfigHolder.setCanSendRequests(expCanSendRequests);

    // then
    expect(internalConfig.networkConfig.canSendRequests).toBe(expCanSendRequests);
  });
});

describe('PrimaryConfigProvider tests', () => {
  test('get primary config', () => {
    // given
    const primaryConfigProvider: PrimaryConfigProvider = internalConfig;

    // when
    const resPrimaryConfig = primaryConfigProvider.getPrimaryConfig();

    // then
    expect(resPrimaryConfig).toBe(primaryConfig);
  });
});