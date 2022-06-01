import {LogLevel} from '../dto/LogLevel';

export class LoggerConfig {
  readonly logLevel: LogLevel;
  readonly logTag: string;

  constructor(logLevel: LogLevel, logTag: string) {
    this.logLevel = logLevel;
    this.logTag = logTag;
  }
}
