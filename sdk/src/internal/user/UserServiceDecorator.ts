import {UserService} from './types';
import {User} from '../../dto/User';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

export class UserServiceDecorator implements UserService {
  private readonly userService: UserService;

  private userLoadingPromise: Promise<User> | undefined = undefined;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async createUser(id: string): Promise<User> {
    return await this.userService.createUser(id);
  }

  async getUser(id: string): Promise<User> {
    if (this.userLoadingPromise) {
      return await this.userLoadingPromise;
    }

    this.userLoadingPromise = this.loadOrCreateUser(id);

    return await this.userLoadingPromise;
  }

  private async loadOrCreateUser(id: string): Promise<User> {
    try {
      return await this.userService.getUser(id);
    } catch (e) {
      if (e instanceof QonversionError && e.code == QonversionErrorCode.UserNotFound) {
        return await this.userService.createUser(id);
      }
      throw e;
    }
  }
}