import {IStorageAssembly} from './types';
import {IUserDataProvider} from '../user';

export class StorageAssembly implements IStorageAssembly {
  userDataProvider(): IUserDataProvider {
    // todo
    return {getUserId: () => 'test', requireUserId: () => 'test'};
  }
}
