/**
 * The builder of Qonversion configuration instance.
 *
 * This class contains a variety of methods to customize the Qonversion SDK behavior.
 * You can call them sequentially and call [build] finally to get the configuration instance.
 *
 * @constructor creates an instance of a builder
 * @param context the current context
 * @param projectKey your Project Key from Qonversion Dashboard
 * @param launchMode launch mode of the Qonversion SDK todo add link
 * @param store the store used for purchases (only [Store.GooglePlay] is supported for now)
 */
import {QonversionConfig} from './QonversionConfig';
import {QonversionError} from './exception/QonversionError';
import {QonversionErrorCode} from './exception/QonversionErrorCode';
import {CacheLifetime} from './dto/CacheLifetime';
import {Environment} from './dto/Environment';
import {LaunchMode} from './dto/LaunchMode';
import {LogLevel} from './dto/LogLevel';
import {PrimaryConfig} from './config/PrimaryConfig';
import {LoggerConfig} from './config/LoggerConfig';
import {NetworkConfig} from './config/NetworkConfig';

const DEFAULT_LOG_TAG = "Qonversion";

export class QonversionConfigBuilder {
  private readonly projectKey: string;
  private readonly launchMode: LaunchMode;
  private environment = Environment.Production;
  private logLevel = LogLevel.Info;
  private logTag = DEFAULT_LOG_TAG;
  private cacheLifetime = CacheLifetime.ThreeDays;

  constructor(projectKey: string, launchMode: LaunchMode) {
    this.projectKey = projectKey;
    this.launchMode = launchMode;
  };

  /**
   * Set current application [Environment]. Used to distinguish sandbox and production users.
   *
   * @param environment current environment.
   * @return builder instance for chain calls.
   */
  setEnvironment(environment: Environment): QonversionConfigBuilder {
    this.environment = environment;
    return this;
  };

  /**
   * Define the maximum lifetime of the data cached by Qonversion.
   * It means that cached data won't be used if it is older than the provided duration.
   * By the way it doesn't mean that cache will live exactly the provided time.
   * It may be updated earlier.
   *
   * Provide as bigger value as possible for you taking into account, among other things,
   * how long may your users remain without the internet connection and so on.
   *
   * @param cacheLifetime the desired lifetime of Qonversion caches.
   * @return builder instance for chain calls.
   */
  setCacheLifetime(cacheLifetime: CacheLifetime): QonversionConfigBuilder {
    this.cacheLifetime = cacheLifetime;
    return this;
  };

  /**
   * Define the level of the logs that the SDK prints.
   * The more strict the level is, the less logs will be written.
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
   * Generate [QonversionConfig] instance with all the provided configurations.
   * This method also validates some of the provided data.
   *
   * @throws QonversionException if unacceptable configuration was provided.
   * @return the complete [QonversionConfig] instance.
   */
  build(): QonversionConfig {
    if (!this.projectKey) {
      throw new QonversionError(QonversionErrorCode.ConfigPreparation, "Project key is empty");
    }

    let primaryConfig = new PrimaryConfig(this.projectKey, this.launchMode, this.environment);
    let loggerConfig = new LoggerConfig(this.logLevel, this.logTag);
    let networkConfig = new NetworkConfig();

    return new QonversionConfig(
      primaryConfig,
      loggerConfig,
      networkConfig,
      this.cacheLifetime
    )
  }
}
