import {IMiscAssembly} from './types';
import {InternalConfig} from '../InternalConfig';
import Logger, {ILogger} from '../logger';
import {ExponentialDelayCalculator, RetryDelayCalculator} from '../network';

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
}
