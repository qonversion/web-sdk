import {LogLevel} from './dto/LogLevel';
import {LaunchMode} from './dto/LaunchMode';
import {Environment} from './dto/Environment';
import {CacheLifetime} from './dto/CacheLifetime';

export type QonversionInstance = {
  /**
   * Set current application {@link Environment}. Used to distinguish sandbox and production users.
   *
   * You may call this function to set an environment separately from {@link Qonversion.initialize}.
   * Call this function only in case you are sure you need to set an environment after the SDK initialization.
   * Otherwise, set an environment via {@link Qonversion.initialize}.
   *
   * @param environment current environment.
   */
  setEnvironment: (environment: Environment) => void;

  /**
   * Define the level of the logs that the SDK prints.
   * The more strict the level is, the fewer logs will be written.
   * For example, setting the log level as Warning will disable all info and verbose logs.
   *
   * You may set log level both *after* Qonversion SDK initializing with {@link QonversionInstance.setLogLevel}
   * and *while* Qonversion initializing with {@link Qonversion.initialize}.
   *
   * See {@link LogLevel} for details.
   *
   * @param logLevel the desired allowed log level.
   */
  setLogLevel: (logLevel: LogLevel) => void;

  /**
   * Define the log tag that the Qonversion SDK will print with every log message.
   * For example, you can use it to filter the Qonversion SDK logs and your app own logs together.
   *
   * You may set log tag both *after* Qonversion SDK initializing with {@link QonversionInstance.setLogTag}
   * and *while* Qonversion initializing with {@link Qonversion.initialize}.
   *
   * @param logTag the desired log tag.
   */
  setLogTag: (logTag: String) => void;

  /**
   * Define the maximum lifetime of the data cached by Qonversion.
   * It means that cached data won't be used if it is older than the provided duration.
   * By the way it doesn't mean that cache will live exactly the provided time.
   * It may be updated earlier.
   *
   * Provide as bigger value as possible for you taking into account, among other things,
   * how long may your users remain without the internet connection and so on.
   *
   * You may set cache lifetime both *after* Qonversion SDK initializing
   * with {@link QonversionInstance.setCacheLifetime} and *while* Qonversion initializing
   * with {@link Qonversion.initialize}.
   *
   * @param cacheLifetime a preferred cache lifetime.
   */
  setCacheLifetime: (cacheLifetime: CacheLifetime) => void;

  /**
   * Call this function when you are done with the current instance of the Qonversion SDK.
   *
   * Please, make sure you have a reason to finish the current instance and initialize the new one.
   * Initializing a new (not the first) instance of the Qonversion SDK is not necessary
   * for the most part of use cases.
   */
  finish: () => void;
};

export type LoggerConfig = {
  readonly logLevel: LogLevel;
  readonly logTag: string;
};

export type NetworkConfig = {
  canSendRequests: boolean;
};

export type PrimaryConfig = {
  readonly projectKey: string;
  readonly launchMode: LaunchMode;
  readonly environment: Environment;
  readonly sdkVersion: string;
};

export type QonversionConfig = {
  readonly primaryConfig: PrimaryConfig;
  readonly loggerConfig: LoggerConfig;
  readonly networkConfig: NetworkConfig;
  readonly cacheLifetime: CacheLifetime;
};
