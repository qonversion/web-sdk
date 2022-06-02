import {Environment} from '../dto/Environment';
import {LogLevel} from '../dto/LogLevel';
import {PrimaryConfig} from '../types';

export type EnvironmentProvider = {
  getEnvironment: () => Environment;
  isSandbox: () => boolean;
};

export type LoggerConfigProvider = {
  getLogLevel: () => LogLevel;
  getLogTag: () => string;
};

export type NetworkConfigProvider = {
  canSendRequests: () => boolean;
  setCanSendRequests: (canSend: boolean) => void;
};

export type PrimaryConfigProvider = {
  getPrimaryConfig: () => PrimaryConfig;
};
