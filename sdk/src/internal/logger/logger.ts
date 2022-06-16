import {Logger, LogMethod} from './types';
import {LoggerConfigProvider} from '../types';
import {LogLevel} from '../../dto/LogLevel';

export default class LoggerImpl implements Logger {
  private readonly loggerConfigProvider: LoggerConfigProvider;

  constructor(loggerConfigProvider: LoggerConfigProvider) {
    this.loggerConfigProvider = loggerConfigProvider;
  }

  verbose(message: string, ...objects: any[]) {
    this.log(LogLevel.Verbose, console.log, message, objects);
  }

  info(message: string, ...objects: any[]) {
    this.log(LogLevel.Info, console.info, message, objects);
  }

  warn(message: string, ...objects: any[]) {
    this.log(LogLevel.Warning, console.warn, message, objects);
  }

  error(message: string, ...objects: any[]) {
    this.log(LogLevel.Error, console.error, message, objects);
  }

  private log(logLevel: LogLevel, logMethod: LogMethod, message: string, ...objects: any[]) {
    const allowedLogLevel = this.loggerConfigProvider.getLogLevel();
    if (logLevel >= allowedLogLevel) {
      const objectCopies = objects.map(value => JSON.parse(JSON.stringify(value)))
      const logMessage = this.loggerConfigProvider.getLogTag() + ' ' + message;
      logMethod(logMessage, objectCopies);
    }
  }
}
