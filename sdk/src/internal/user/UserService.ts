import {UserApi, UserService} from './types';
import {User} from '../../dto/User';
import {ApiInteractor, ApiResponseSuccess, RequestConfigurator} from '../network';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';
import {HTTP_CODE_NOT_FOUND} from '../network/constants';
import {camelCaseKeys} from '../utils/objectUtils';
import {PrimaryConfigProvider} from '../types';

export class UserServiceImpl implements UserService {
  private readonly primaryConfigProvider: PrimaryConfigProvider;
  private readonly requestConfigurator: RequestConfigurator;
  private readonly apiInteractor: ApiInteractor;

  constructor(
    primaryConfigProvider: PrimaryConfigProvider,
    requestConfigurator: RequestConfigurator,
    apiInteractor: ApiInteractor,
  ) {
    this.primaryConfigProvider = primaryConfigProvider;
    this.requestConfigurator = requestConfigurator;
    this.apiInteractor = apiInteractor;
  }

  async createUser(id: string): Promise<User> {
    const environment = this.primaryConfigProvider.getPrimaryConfig().environment;
    const request = this.requestConfigurator.configureCreateUserRequest(id, environment);
    const response = await this.apiInteractor.execute<UserApi>(request);

    if (response.isSuccess) {
      return UserServiceImpl.userOf(response);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }

  async getUser(id: string): Promise<User> {
    const request = this.requestConfigurator.configureUserRequest(id);
    const response = await this.apiInteractor.execute<UserApi>(request);

    if (response.isSuccess) {
      return UserServiceImpl.userOf(response);
    }

    if (response.code == HTTP_CODE_NOT_FOUND) {
      throw new QonversionError(QonversionErrorCode.UserNotFound, `Id: ${id}`);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }

  /**
   * A 2xx body is any JSON document; only an object with a non-empty string id is a
   * user. Anything else is a backend error carrying the HTTP status; the body is not
   * copied into the message.
   */
  private static userOf(response: ApiResponseSuccess<UserApi>): User {
    const data: unknown = response.data;
    const id = data && typeof data === 'object' ? (data as {id?: unknown}).id : undefined;
    if (typeof id !== 'string' || id.length === 0) {
      throw new QonversionError(
        QonversionErrorCode.BackendError,
        'Unexpected user response',
        undefined,
        response.code,
      );
    }

    return camelCaseKeys<User>(response.data);
  }
}
