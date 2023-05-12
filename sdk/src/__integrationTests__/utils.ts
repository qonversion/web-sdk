import {QonversionErrorCode} from '../exception/QonversionErrorCode';
import {QonversionError} from '../exception/QonversionError';
import {DependenciesAssembly, DependenciesAssemblyBuilder} from '../internal/di/DependenciesAssembly';
import {QonversionConfigBuilder} from '../QonversionConfigBuilder';
import {PROJECT_KEY_FOR_TESTS} from './constants';
import {InternalConfig} from '../internal';
import {Environment} from '../dto/Environment';

export const getCurrentTs = (): number => Math.floor(Date.now() / 1000);

export const getDependencyAssembly = (config: {apiUrl?: string, environment?: Environment} = {}): DependenciesAssembly => {
  const qonversionConfig = new QonversionConfigBuilder(PROJECT_KEY_FOR_TESTS)
    .setEnvironment(config.environment ?? Environment.Production)
    .build();
  if (config.apiUrl) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // noinspection JSConstantReassignment
    qonversionConfig.networkConfig.apiUrl = config.apiUrl;
  }
  const internalConfig = new InternalConfig(qonversionConfig);
  return new DependenciesAssemblyBuilder(internalConfig).build();
};

export const expectQonversionErrorAsync = async (code: QonversionErrorCode, message: string, method: () => Promise<unknown>) => {
  try {
    await method();
  } catch (e) {
    expect(e).toBeInstanceOf(QonversionError);
    expect((e as QonversionError).code).toBe(code);
    expect((e as QonversionError).message).toBe(message);
    return;
  }
  fail("Exception expected but was not thrown");
}

const fail = (reason = "Fail was called in a test") => {
  throw new Error(reason);
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.fail = fail;
