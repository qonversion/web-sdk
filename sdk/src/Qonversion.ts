import {QonversionConfig, QonversionInstance} from './types';
import {QonversionError} from './exception/QonversionError';
import {QonversionErrorCode} from './exception/QonversionErrorCode';
import {QonversionInternal, InternalConfig} from './internal';
import {DependenciesAssemblyBuilder} from './internal/di/DependenciesAssembly';

class Qonversion {
  private static backingInstance: QonversionInstance | undefined = undefined

  private constructor() {}

  /**
   * Use this method to get a current initialized instance of the Qonversion SDK.
   * Please, use the method only after calling {@link Qonversion.initialize}.
   * Otherwise, calling the method will cause an exception.
   *
   * @return Current initialized instance of the Qonversion SDK.
   * @throws a {@link QonversionError} with {@link QonversionErrorCode.NotInitialized}.
   */
  static getSharedInstance(): QonversionInstance {
    if (!Qonversion.backingInstance) {
      throw new QonversionError(QonversionErrorCode.NotInitialized);
    }
    return Qonversion.backingInstance;
  }

  /**
   * An entry point to use Qonversion SDK. Call to initialize Qonversion SDK with required and extra configs.
   * The function is the best way to set additional configs you need to use Qonversion SDK.
   * You still have an option to set a part of additional configs later via calling separated setters.
   *
   * @param config a config that contains key SDK settings.
   * Call {@link QonversionConfigBuilder.build} to configure and create a {@link QonversionConfig} instance.
   * @return Initialized instance of the Qonversion SDK.
   */
  static initialize(config: QonversionConfig): QonversionInstance {
    const internalConfig = new InternalConfig(config);
    const dependenciesAssembly = new DependenciesAssemblyBuilder(internalConfig).build();
    const instance = new QonversionInternal(internalConfig, dependenciesAssembly);
    Qonversion.backingInstance = instance;
    return instance;
  }
}

export default Qonversion;
