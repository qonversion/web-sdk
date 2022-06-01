import {LaunchMode} from '../dto/LaunchMode';
import {Environment} from '../dto/Environment';

const packageJson = require('./package.json');

export class PrimaryConfig {
  readonly projectKey: string;
  readonly launchMode: LaunchMode;
  readonly environment: Environment;
  readonly sdkVersion: string = packageJson.version;

  constructor(projectKey: string, launchMode: LaunchMode, environment: Environment) {
    this.projectKey = projectKey;
    this.launchMode = launchMode;
    this.environment = environment;
  }
}
