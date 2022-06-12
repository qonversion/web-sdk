import {IMiscAssembly} from './types';
import {InternalConfig} from '../InternalConfig';
import Logger, {ILogger} from '../logger';
import {ExponentialDelayCalculator, RetryDelayCalculator} from '../network';
import {DelayedWorker, DelayedWorkerImpl} from '../utils/DelayedWorker';
import {UserIdGenerator, UserIdGeneratorImpl} from '../user';

export class MiscAssembly implements IMiscAssembly {
  private readonly internalConfig: InternalConfig;

  constructor(internalConfig: InternalConfig) {
    this.internalConfig = internalConfig;
  }

  logger(): ILogger {
    return new Logger(this.internalConfig);
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
