import {UserPropertiesService} from './types';
import {IApiInteractor, IRequestConfigurator} from '../network';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

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

    if (response.isSuccess) {
      return response.data.processed;
    }

    const errorMessage = "Response code " + response.code + ", message: " + response.message;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }
}
