import {LoggerConfigProvider} from '../../../src/internal';
import {LogLevel} from '../../../src';
import LoggerImpl from '../../../src/internal/logger';

const testLogTag = 'tag';
let allowedLogLevel = LogLevel.Disabled;
const loggerConfigProvider: LoggerConfigProvider = {
  getLogLevel(): LogLevel {
    return allowedLogLevel;
  },
  getLogTag(): string {
    return testLogTag;
  }
};
const someAdditionalParam = {someField: 'someValue'};

const logger = new LoggerImpl(loggerConfigProvider);

describe('logging methods', function () {
  const loggerSpy = jest.spyOn(LoggerImpl.prototype as any, 'log');

  test('verbose', () => {
    // given
    const message = 'test verbose message';

    // when
    logger.verbose(message, someAdditionalParam);

    // then
    expect(loggerSpy).toHaveBeenCalledWith(LogLevel.Verbose, console.log, message, [someAdditionalParam]);
  });

  test('info', () => {
    // given
    const message = 'test info message';

    // when
    logger.info(message, someAdditionalParam);

    // then
    expect(loggerSpy).toHaveBeenCalledWith(LogLevel.Info, console.info, message, [someAdditionalParam]);
  });

  test('warning', () => {
    // given
    const message = 'test warning message';

    // when
    logger.warn(message, someAdditionalParam);

    // then
    expect(loggerSpy).toHaveBeenCalledWith(LogLevel.Warning, console.warn, message, [someAdditionalParam]);
  });

  test('error', () => {
    // given
    const message = 'test error message';

    // when
    logger.error(message, someAdditionalParam);

    // then
    expect(loggerSpy).toHaveBeenCalledWith(LogLevel.Error, console.error, message, [someAdditionalParam]);
  });
});

describe('core log method', function () {
  const testMessage = 'test message';
  const expMessage = `${testLogTag}: ${testMessage}`;

  test('configured log level is higher than called one', () => {
    // given
    allowedLogLevel = LogLevel.Warning;
    const logMethod = jest.fn();

    // when
    logger['log'](LogLevel.Error, logMethod, testMessage, [someAdditionalParam]);

    // then
    expect(logMethod).toHaveBeenCalledWith(expMessage, someAdditionalParam);
  });

  test('configured log level is exact the same as called one', () => {
    // given
    allowedLogLevel = LogLevel.Warning;
    const logMethod = jest.fn();

    // when
    logger['log'](LogLevel.Warning, logMethod, testMessage, [someAdditionalParam]);

    // then
    expect(logMethod).toHaveBeenCalledWith(expMessage, someAdditionalParam);
  });

  test('configured log level is lower than called one', () => {
    // given
    allowedLogLevel = LogLevel.Warning;
    const logMethod = jest.fn();

    // when
    logger['log'](LogLevel.Info, logMethod, testMessage, [someAdditionalParam]);

    // then
    expect(logMethod).not.toBeCalled();
  });

  test('calling without additional params', () => {
    // given
    allowedLogLevel = LogLevel.Warning;
    const logMethod = jest.fn();

    // when
    logger['log'](LogLevel.Error, logMethod, testMessage, []);

    // then
    expect(logMethod).toHaveBeenCalledWith(expMessage);
  });
});
