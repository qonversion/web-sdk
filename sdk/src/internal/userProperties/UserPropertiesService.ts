import {UserPropertiesSendResponse, UserPropertiesService, UserPropertyData} from './types';
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

  async sendProperties(userId: string, properties: Record<string, string>): Promise<UserPropertiesSendResponse> {
    const propertiesList: UserPropertyData[] = Object.keys(properties).map(key => ({
      key,
      value: properties[key],
    }));

    const request = this.requestConfigurator.configureUserPropertiesSendRequest(userId, propertiesList);
    const response = await this.apiInteractor.execute<UserPropertiesSendResponse>(request);

    if (response.isSuccess) {
      return response.data;
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }

  async getProperties(userId: string): Promise<UserPropertyData[]> {
    const request = this.requestConfigurator.configureUserPropertiesGetRequest(userId);
    const response = await this.apiInteractor.execute<UserPropertyData[]>(request);

    if (response.isSuccess) {
      return response.data;
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }
}
