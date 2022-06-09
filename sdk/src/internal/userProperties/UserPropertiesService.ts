import {UserPropertiesService} from './types';
import {IApiInteractor, IRequestConfigurator} from '../network';

export class UserPropertiesServiceImpl implements UserPropertiesService {
  private readonly requestConfigurator: IRequestConfigurator;
  private readonly apiInteractor: IApiInteractor;

  constructor(requestConfigurator: IRequestConfigurator, apiInteractor: IApiInteractor) {
    this.requestConfigurator = requestConfigurator;
    this.apiInteractor = apiInteractor;
  }

  async sendProperties(properties: Record<string, string>): Promise<string[]> {
    const request = this.requestConfigurator.configureUserPropertiesRequest(properties);
    const response = await this.apiInteractor.execute<{processed: string[]}>(request);

    return Promise.resolve([]);
  }
}