import {IStorageAssembly} from './types';
import {IUserDataProvider} from '../user';
import {LocalStorage, LocalStorageImpl, StorageConstants} from '../common';
import {UserPropertiesStorage, UserPropertiesStorageImpl} from '../userProperties';

export class StorageAssembly implements IStorageAssembly {
  localStorage(): LocalStorage {
    return new LocalStorageImpl();
  }

  userDataProvider(): IUserDataProvider {
    // todo
    return {getUserId: () => 'test', requireUserId: () => 'test'};
  }

  pendingUserPropertiesStorage(): UserPropertiesStorage {
    return this.userPropertiesStorage(StorageConstants.PendingUserProperties);
  }

  sentUserPropertiesStorage(): UserPropertiesStorage {
    return this.userPropertiesStorage(StorageConstants.SentUserProperties);
  }

  private userPropertiesStorage(key: string): UserPropertiesStorage {
    return new UserPropertiesStorageImpl(this.localStorage(), key);
  }
}
