import {UserPropertiesService} from './types';
import {ApiInteractor, RequestConfigurator} from '../network';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

export class UserPropertiesServiceImpl implements UserPropertiesService {
  private readonly requestConfigurator: RequestConfigurator;
  private readonly apiInteractor: ApiInteractor;

  constructor(requestConfigurator: RequestConfigurator, apiInteractor: ApiInteractor) {
    this.requestConfigurator = requestConfigurator;
    this.apiInteractor = apiInteractor;
  }

  async sendProperties(properties: Record<string, string>): Promise<string[]> {
    const request = this.requestConfigurator.configureUserPropertiesRequest(properties);
    const response = await this.apiInteractor.execute<{data: {processed: string[]}}>(request);

    if (response.isSuccess) {
      return response.data.data.processed;
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }
}
