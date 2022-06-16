import {EntitlementsResponse, EntitlementsService} from './types';
import {Entitlement} from '../../dto/Entitlement';
import {ApiInteractor, RequestConfigurator} from '../network';
import {camelcaseKeys} from '../utils/objectUtils';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';
import {HTTP_NOT_FOUND} from '../network/constants';

export class EntitlementsServiceImpl implements EntitlementsService {
  private readonly requestConfigurator: RequestConfigurator;
  private readonly apiInteractor: ApiInteractor;

  constructor(requestConfigurator: RequestConfigurator, apiInteractor: ApiInteractor) {
    this.requestConfigurator = requestConfigurator;
    this.apiInteractor = apiInteractor;
  }

  async getEntitlements(userId: string): Promise<Entitlement[]> {
    const request = this.requestConfigurator.configureEntitlementsRequest(userId);
    const response = await this.apiInteractor.execute<EntitlementsResponse>(request);

    if (response.isSuccess) {
      return camelcaseKeys<Entitlement[]>(response.data.data);
    }

    if (response.code == HTTP_NOT_FOUND) {
      throw new QonversionError(QonversionErrorCode.UserNotFound, `User id: ${userId}`);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }
}
