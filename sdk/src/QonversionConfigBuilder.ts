import {QonversionError} from './exception/QonversionError';
import {QonversionErrorCode} from './exception/QonversionErrorCode';
import {Environment} from './dto/Environment';
import {LogLevel} from './dto/LogLevel';
import {LoggerConfig, NetworkConfig, PrimaryConfig, QonversionConfig} from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../package.json');
const DEFAULT_LOG_TAG = "Qonversion";

/**
 * The builder of Qonversion configuration instance.
 *
 * This class contains a variety of methods to customize the Qonversion SDK behavior.
 * You can call them sequentially and call {@link build} finally to get the configuration instance.
 */
export class QonversionConfigBuilder {
  private readonly projectKey: string;
  private environment = Environment.Production;
  private logLevel = LogLevel.Info;
  private logTag = DEFAULT_LOG_TAG;

  /**
   * Creates an instance of a builder
   * @param projectKey your Project Key from Qonversion Dashboard
   */
  constructor(projectKey: string) {
    this.projectKey = projectKey;
  };

  /**
   * Set current application {@link Environment}. Used to distinguish sandbox and production users.
   *
   * @param environment current environment.
   * @return builder instance for chain calls.
   */
  setEnvironment(environment: Environment): QonversionConfigBuilder {
    this.environment = environment;
    return this;
  };

  /**
   * Define the level of the logs that the SDK prints.
   * The more strict the level is, the fewer logs will be written.
   * For example, setting the log level as Warning will disable all info and verbose logs.
   *
   * @param logLevel the desired allowed log level.
   * @return builder instance for chain calls.
   */
  setLogLevel(logLevel: LogLevel): QonversionConfigBuilder {
    this.logLevel = logLevel;
    return this;
  };

  /**
   * Define the log tag that the Qonversion SDK will print with every log message.
   * For example, you can use it to filter the Qonversion SDK logs and your app own logs together.
   *
   * @param logTag the desired log tag.
   * @return builder instance for chain calls.
   */
  setLogTag(logTag: string): QonversionConfigBuilder {
    this.logTag = logTag;
    return this;
  };

  /**
   * Generate {@link QonversionConfig} instance with all the provided configurations.
   *
   * @throws a {@link QonversionError} if unacceptable configuration was provided.
   * @return the complete {@link QonversionConfig} instance.
   */
  build(): QonversionConfig {
    if (!this.projectKey) {
      throw new QonversionError(QonversionErrorCode.ConfigPreparation, "Project key is empty");
    }

    const primaryConfig: PrimaryConfig = {
      projectKey: this.projectKey,
      environment: this.environment,
      sdkVersion: packageJson.version,
    };

    const loggerConfig: LoggerConfig = {
      logLevel: this.logLevel,
      logTag: this.logTag,
    };

    const networkConfig: NetworkConfig = {
      canSendRequests: true,
    };

    return {
      primaryConfig,
      loggerConfig,
      networkConfig,
    };
  }
}
