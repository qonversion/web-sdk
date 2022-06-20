import {UserApi, UserService} from './types';
import {User} from '../../dto/User';
import {IApiInteractor, IRequestConfigurator} from '../network';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';
import {HTTP_NOT_FOUND} from '../network/constants';
import {camelcaseKeys} from '../utils/objectUtils';

export class UserServiceImpl implements UserService {
  private readonly requestConfigurator: IRequestConfigurator;
  private readonly apiInteractor: IApiInteractor;

  constructor(requestConfigurator: IRequestConfigurator, apiInteractor: IApiInteractor) {
    this.requestConfigurator = requestConfigurator;
    this.apiInteractor = apiInteractor;
  }

  async createUser(id: string): Promise<User> {
    const request = this.requestConfigurator.configureCreateUserRequest(id);
    const response = await this.apiInteractor.execute<UserApi>(request);

    if (response.isSuccess) {
      return camelcaseKeys(response.data);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }

  async getUser(id: string): Promise<User> {
    const request = this.requestConfigurator.configureUserRequest(id);
    const response = await this.apiInteractor.execute<UserApi>(request);

    if (response.isSuccess) {
      return camelcaseKeys(response.data);
    }

    if (response.code == HTTP_NOT_FOUND) {
      throw new QonversionError(QonversionErrorCode.UserNotFound, `Id: ${id}`);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }
}
