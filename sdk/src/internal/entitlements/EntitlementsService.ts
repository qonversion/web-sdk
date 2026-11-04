import {EntitlementsResponse, EntitlementsService} from './types';
import {Entitlement} from '../../dto/Entitlement';
import {ApiInteractor, ApiResponseSuccess, RequestConfigurator} from '../network';
import {camelCaseKeys} from '../utils/objectUtils';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';
import {HTTP_CODE_NOT_FOUND} from '../network/constants';

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
      return EntitlementsServiceImpl.entitlementsOf(response);
    }

    if (response.code == HTTP_CODE_NOT_FOUND) {
      throw new QonversionError(QonversionErrorCode.UserNotFound, `User id: ${userId}`);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }

  /**
   * A 2xx body is any JSON document; only an object whose `data` is an array is an
   * entitlements list. Anything else is a backend error carrying the HTTP status; the
   * body is not copied into the message.
   */
  private static entitlementsOf(response: ApiResponseSuccess<EntitlementsResponse>): Entitlement[] {
    const data: unknown = response.data;
    const list = data && typeof data === 'object' ? (data as {data?: unknown}).data : undefined;
    if (!Array.isArray(list)) {
      throw new QonversionError(
        QonversionErrorCode.BackendError,
        'Unexpected entitlements response',
        undefined,
        response.code,
      );
    }

    return camelCaseKeys<Entitlement[]>(list);
  }
}
