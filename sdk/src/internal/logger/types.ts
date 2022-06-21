export type LogMethod = (message: string, ...objects: unknown[]) => void;

export type Logger = {
  verbose: LogMethod;

  info: LogMethod;

  warn: LogMethod;

  error: LogMethod;
};
