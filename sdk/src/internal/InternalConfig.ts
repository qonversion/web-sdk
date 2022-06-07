import {EnvironmentProvider, LoggerConfigProvider, NetworkConfigHolder, PrimaryConfigProvider} from './types';
import {Environment} from '../dto/Environment';
import {LoggerConfig, NetworkConfig, PrimaryConfig, QonversionConfig} from '../types';
import {LogLevel} from '../dto/LogLevel';

export class InternalConfig implements PrimaryConfigProvider, NetworkConfigHolder, LoggerConfigProvider, EnvironmentProvider {
  primaryConfig: PrimaryConfig;
  readonly networkConfig: NetworkConfig;
  loggerConfig: LoggerConfig;

  constructor(qonversionConfig: QonversionConfig) {
    this.primaryConfig = qonversionConfig.primaryConfig;
    this.networkConfig = qonversionConfig.networkConfig;
    this.loggerConfig = qonversionConfig.loggerConfig;
  }

  canSendRequests(): boolean {
    return this.networkConfig.canSendRequests;
  }

  setCanSendRequests(canSend: boolean) {
    this.networkConfig.canSendRequests = canSend;
  }

  getEnvironment(): Environment {
    return this.primaryConfig.environment;
  }

  getLogLevel(): LogLevel {
    return this.loggerConfig.logLevel;
  }

  getLogTag(): string {
    return this.loggerConfig.logTag;
  }

  getPrimaryConfig(): PrimaryConfig {
    return this.primaryConfig;
  }

  isSandbox(): boolean {
    return this.getEnvironment() == Environment.Sandbox;
  }
}
