import {IdentityApi, IdentityService} from './types';
import {ApiInteractor, RequestConfigurator} from '../network';
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
      return response.data.user_id;
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }

  async obtainIdentity(identityId: string): Promise<string> {
    const request = this.requestConfigurator.configureIdentityRequest(identityId);
    const response = await this.apiInteractor.execute<IdentityApi>(request);

    if (response.isSuccess) {
      return response.data.user_id;
    }

    if (response.code == HTTP_CODE_NOT_FOUND) {
      throw new QonversionError(QonversionErrorCode.IdentityNotFound, `Id: ${identityId}`);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }
}