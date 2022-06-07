import {QonversionInstance} from '../types';
import {InternalConfig} from './InternalConfig';
import {LogLevel} from '../dto/LogLevel';
import {Environment} from '../dto/Environment';
import {DependenciesAssembly} from './di/DependenciesAssembly';
import Qonversion from '../Qonversion';

export class QonversionInternal implements QonversionInstance {
  private readonly internalConfig: InternalConfig;
  private readonly dependenciesAssembly: DependenciesAssembly;

  constructor(internalConfig: InternalConfig, dependenciesAssembly: DependenciesAssembly) {
    this.internalConfig = internalConfig;
    this.dependenciesAssembly = dependenciesAssembly;
  }

  finish() {
    if (Qonversion["backingInstance"] == this) {
      Qonversion["backingInstance"] = undefined
    }
  }

  setEnvironment(environment: Environment) {
    this.internalConfig.primaryConfig = {...this.internalConfig.primaryConfig, environment};
  }

  setLogLevel(logLevel: LogLevel) {
    this.internalConfig.loggerConfig = {...this.internalConfig.loggerConfig, logLevel};
  }

  setLogTag(logTag: string) {
    this.internalConfig.loggerConfig = {...this.internalConfig.loggerConfig, logTag};
  }
}
