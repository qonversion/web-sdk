import {QonversionConfig, QonversionInstance} from './types';
import {QonversionError} from './exception/QonversionError';
import {QonversionErrorCode} from './exception/QonversionErrorCode';

let backingInstance: QonversionInstance | undefined = undefined

/**
 * Use this method to get a current initialized instance of the Qonversion SDK.
 * Please, use the method only after calling {@link Qonversion.initialize}.
 * Otherwise, calling the method will cause an exception.
 *
 * @return Current initialized instance of the Qonversion SDK.
 * @throws a {@link QonversionError} with {@link QonversionErrorCode.NotInitialized}.
 */
function getSharedInstance(): QonversionInstance {
  if (!backingInstance) {
    throw new QonversionError(QonversionErrorCode.NotInitialized);
  }
  return backingInstance;
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
function initialize(config: QonversionConfig): QonversionInstance {
  throw Error("not initialized");
}

const Qonversion = {
  getSharedInstance,
  initialize,
};

export default Qonversion;
