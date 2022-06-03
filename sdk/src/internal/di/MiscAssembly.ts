import {IMiscAssembly} from './types';
import {ILogger} from '../logger/types';
import {InternalConfig} from '../InternalConfig';
import Logger from '../logger';

export class MiscAssembly implements IMiscAssembly {
  private readonly internalConfig: InternalConfig;

  constructor(internalConfig: InternalConfig) {
    this.internalConfig = internalConfig;
  }

  logger(): ILogger {
    return new Logger(this.internalConfig);
  }
}
