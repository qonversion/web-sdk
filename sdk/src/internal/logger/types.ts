export type LogMethod = (message: string, ...objects: any[]) => void;

export type ILogger = {
  verbose: LogMethod;

  info: LogMethod;

  warn: LogMethod;

  error: LogMethod;
};
