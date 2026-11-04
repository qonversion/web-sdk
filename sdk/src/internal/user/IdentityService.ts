import {IdentityApi, IdentityService} from './types';
import {ApiInteractor, ApiResponseSuccess, RequestConfigurator} from '../network';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';
import {HTTP_CODE_NOT_FOUND} from '../network/constants';

export class IdentityServiceImpl implements IdentityService {
  private readonly requestConfigurator: RequestConfigurator;
  private readonly apiInteractor: ApiInteractor;

  constructor(requestConfigurator: RequestConfigurator, apiInteractor: ApiInteractor) {
    this.requestConfigurator = requestConfigurator;
    this.apiInteractor = apiInteractor;
  }

  async createIdentity(qonversionId: string, identityId: string): Promise<string> {
    const request = this.requestConfigurator.configureCreateIdentityRequest(qonversionId, identityId);
    const response = await this.apiInteractor.execute<IdentityApi>(request);

    if (response.isSuccess) {
      return IdentityServiceImpl.userIdOf(response);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }

  async obtainIdentity(identityId: string): Promise<string> {
    const request = this.requestConfigurator.configureIdentityRequest(identityId);
    const response = await this.apiInteractor.execute<IdentityApi>(request);

    if (response.isSuccess) {
      return IdentityServiceImpl.userIdOf(response);
    }

    if (response.code == HTTP_CODE_NOT_FOUND) {
      throw new QonversionError(QonversionErrorCode.IdentityNotFound, `Id: ${identityId}`);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }

  /**
   * A 2xx body is any JSON document, and the user id read from it becomes the current
   * user of the SDK, so it is used only when it is a non-empty string. Anything else is
   * a backend error carrying the HTTP status; the body is not copied into the message.
   */
  private static userIdOf(response: ApiResponseSuccess<IdentityApi>): string {
    const data: unknown = response.data;
    const userId = data && typeof data === 'object' ? (data as {user_id?: unknown}).user_id : undefined;
    if (typeof userId !== 'string' || userId.length === 0) {
      throw new QonversionError(
        QonversionErrorCode.BackendError,
        'Unexpected identity response',
        undefined,
        response.code,
      );
    }

    return userId;
  }
}