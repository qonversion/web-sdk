import {LogLevel} from './dto/LogLevel';
import {LaunchMode} from './dto/LaunchMode';
import {Environment} from './dto/Environment';
import {UserProperty} from './dto/UserProperty';
import {Entitlement} from './dto/Entitlement';
import {PurchaseCoreData, StripeStoreData, UserPurchase} from './dto/Purchase';

export type QonversionInstance = {
  /**
   * Call this function to send completed Stripe purchase to our API. The purchase will be linked to the current user,
   * and he will gain corresponding entitlements, described in the Qonversion Product Center.
   *
   * @param data information about completed purchase.
   * @returns a purchase info, saved on the API.
   */
  sendStripePurchase: (data: PurchaseCoreData & StripeStoreData) => Promise<UserPurchase>;

  /**
   * Call this function to receive all entitlements of the current user. If you initiated user changing
   * actions like {@link identify} or {@link logout} be sure to await their ending and only after it request
   * entitlements.
   *
   * @returns a list of current user entitlements.
   */
  getEntitlements: () => Promise<Entitlement[]>;

  /**
   * Call this function to link a user to his unique id in your system and share purchase data.
   * If you want to check identified user permissions await for returned promise to resolve and
   * call [todo checkEntitlements link] then.
   *
   * @param userId - unique user id in your system
   */
  identify: (userId: string) => Promise<void>;

  /**
   * Call this function to unlink a user from his unique ID in your system and his purchase data.
   * If you want to check logged out user permissions await for returned promise to resolve and
   * call [todo checkEntitlements link] then.
   */
  logout: () => Promise<void>;

  /**
   * Add property value for the current user to use it then for segmentation or analytics
   * as well as to provide it to third-party platforms.
   *
   * This method consumes only defined user properties. In order to pass custom property
   * consider using {@link setCustomUserProperty} method.
   *
   * You can either pass multiple properties at once using {@link setUserProperties} method.
   *
   * @param property defined user attribute
   * @param value nonempty value for the given property
   */
  setUserProperty: (property: UserProperty, value: string) => void;

  /**
   * Add property value for the current user to use it then for segmentation or analytics
   * as well as to provide it to third-party platforms.
   *
   * This method consumes custom user properties. In order to pass defined property
   * consider using {@link setUserProperty} method.
   *
   * You can either pass multiple properties at once using {@link setUserProperties} method.
   *
   * @param key nonempty key for user property consisting of letters A-Za-z, numbers, and symbols _.:-
   * @param value nonempty value for the given property
   */
  setCustomUserProperty: (key: string, value: string) => void;

  /**
   * Add a property value for the current user to use it then for segmentation or analytics
   * as well as to provide it to third-party platforms.
   *
   * This method consumes both defined and custom user properties. Consider using
   * {@link UserPropertiesBuilder} to prepare a properties map. You are also able to create it
   * on your own using a custom key for a custom property or {@link UserProperty} code as the key for
   * a Qonversion defined property.
   *
   * In order to pass a single property consider using {@link setCustomUserProperty} method for
   * a custom key and {@link setUserProperty} for a defined one.
   *
   * @param userProperties record of nonempty key-value pairs of user properties
   */
  setUserProperties: (userProperties: Record<string, string>) => void;

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
  setLogTag: (logTag: string) => void;

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
};
