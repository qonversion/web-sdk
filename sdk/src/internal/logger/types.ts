export type LogMethod = (message: string, ...objects: any[]) => void;

export type Logger = {
  verbose: LogMethod;

  info: LogMethod;

  warn: LogMethod;

  error: LogMethod;
};
