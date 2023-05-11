import {
  Environment,
  LogLevel,
  QonversionConfig,
  QonversionConfigBuilder,
  QonversionErrorCode
} from '../index';
import {LoggerConfig, NetworkConfig, PrimaryConfig} from "../types";
import {expectQonversionError} from './utils';
import {API_URL} from '../internal/network';

const packageJson = require('../../../package.json');

test('constructor', () => {
  // given
  const projectKey = "test_key";

  // when
  const builder = new QonversionConfigBuilder(projectKey);

  // then
  expect(builder["projectKey"]).toBe(projectKey);
});

test('setting environment type', () => {
  // given
  const builder = new QonversionConfigBuilder('test');
  const environment = Environment.Sandbox;

  // when
  builder.setEnvironment(environment);

  // then
  expect(builder["environment"]).toBe(environment);
});

test('setting log level', () => {
  // given
  const builder = new QonversionConfigBuilder('test');
  const logLevel = LogLevel.Error;

  // when
  builder.setLogLevel(logLevel);

  // then
  expect(builder["logLevel"]).toBe(logLevel);
});

test('setting log tag', () => {
  // given
  const builder = new QonversionConfigBuilder('test');
  const logTag = "test tag";

  // when
  builder.setLogTag(logTag);

  // then
  expect(builder["logTag"]).toBe(logTag);
});

test('successful build with full list of arguments', () => {
  // given
  const mockLogLevel = LogLevel.Warning;
  const mockLogTag = "test tag";
  const mockEnvironment = Environment.Sandbox;
  const projectKey = "test key";

  const builder = new QonversionConfigBuilder(projectKey);
  builder["logLevel"] = mockLogLevel;
  builder["logTag"] = mockLogTag;
  builder["environment"] = mockEnvironment;

  const expPrimaryConfig: PrimaryConfig = {
    projectKey,
    environment: mockEnvironment,
    sdkVersion: packageJson.version,
  };
  const expLoggerConfig: LoggerConfig = {
    logLevel: mockLogLevel,
    logTag: mockLogTag,
  };
  const expNetworkConfig: NetworkConfig = {
    canSendRequests: true,
    apiUrl: API_URL,
  };
  const expResult: QonversionConfig = {
    primaryConfig: expPrimaryConfig,
    loggerConfig: expLoggerConfig,
    networkConfig: expNetworkConfig,
  };

  // when
  const result = builder.build()

  // then
  expect(result).toStrictEqual(expResult);
});

test('successful build without full list of arguments', () => {
  // given
  const defaultLogLevel = LogLevel.Info;
  const defaultLogTag = "Qonversion";
  const defaultEnvironment = Environment.Production;
  const defaultCanSendRequests = true;
  const projectKey = "test key";

  const builder = new QonversionConfigBuilder(projectKey);

  const expPrimaryConfig: PrimaryConfig = {
    projectKey,
    environment: defaultEnvironment,
    sdkVersion: packageJson.version,
  };
  const expLoggerConfig: LoggerConfig = {
    logLevel: defaultLogLevel,
    logTag: defaultLogTag,
  };
  const expNetworkConfig: NetworkConfig = {
    canSendRequests: defaultCanSendRequests,
    apiUrl: API_URL,
  };
  const expResult: QonversionConfig = {
    primaryConfig: expPrimaryConfig,
    loggerConfig: expLoggerConfig,
    networkConfig: expNetworkConfig,
  };

  // when
  const result = builder.build()

  // then
  expect(result).toStrictEqual(expResult);
});

test('building with blank project key', () => {
  // given
  const builder = new QonversionConfigBuilder("");
  const testingMethod = builder.build.bind(builder);

  // when and then
  expectQonversionError(QonversionErrorCode.ConfigPreparation, testingMethod);
});
