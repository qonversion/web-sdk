import {MiscAssembly} from './types';
import {InternalConfig} from '../InternalConfig';
import LoggerImpl, {Logger} from '../logger';
import {ExponentialDelayCalculator, RetryDelayCalculator} from '../network';
import {DelayedWorker, DelayedWorkerImpl} from '../utils/DelayedWorker';
import {UserIdGenerator, UserIdGeneratorImpl} from '../user';

export class MiscAssemblyImpl implements MiscAssembly {
  private readonly internalConfig: InternalConfig;

  constructor(internalConfig: InternalConfig) {
    this.internalConfig = internalConfig;
  }

  logger(): Logger {
    return new LoggerImpl(this.internalConfig);
  }

  exponentialDelayCalculator(): RetryDelayCalculator {
    return new ExponentialDelayCalculator();
  }

  delayedWorker(): DelayedWorker {
    return new DelayedWorkerImpl();
  }

  userIdGenerator(): UserIdGenerator {
    return new UserIdGeneratorImpl();
  }
}
