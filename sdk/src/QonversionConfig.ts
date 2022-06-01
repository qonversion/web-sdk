/**
 * This class contains all the available configurations for the initialization of Qonversion SDK.
 *
 * To create an instance, use the nested [Builder] class.
 *
 * You should pass the created instance to the [Qonversion.initialize] method.
 *
 * @see [The documentation](https://documentation.qonversion.io/v3.0/docs/configuring-the-sdks)
 */
import {PrimaryConfig} from './config/PrimaryConfig';
import {LoggerConfig} from './config/LoggerConfig';
import {NetworkConfig} from './config/NetworkConfig';
import {CacheLifetime} from './dto/CacheLifetime';

export class QonversionConfig {
  readonly primaryConfig: PrimaryConfig;
  readonly loggerConfig: LoggerConfig;
  readonly networkConfig: NetworkConfig;
  readonly cacheLifetime: CacheLifetime;

  constructor(primaryConfig: PrimaryConfig, loggerConfig: LoggerConfig, networkConfig: NetworkConfig, cacheLifetime: CacheLifetime) {
    this.primaryConfig = primaryConfig;
    this.loggerConfig = loggerConfig;
    this.networkConfig = networkConfig;
    this.cacheLifetime = cacheLifetime;
  }
}
