import {IStorageAssembly} from './types';
import {IUserDataProvider, UserDataStorage, UserDataStorageImpl} from '../user';
import {LocalStorage, LocalStorageImpl, StorageConstants} from '../common';
import {UserPropertiesStorage, UserPropertiesStorageImpl} from '../userProperties';

export class StorageAssembly implements IStorageAssembly {
  localStorage(): LocalStorage {
    return new LocalStorageImpl();
  }

  userDataProvider(): IUserDataProvider {
    return this.userDataStorage();
  }

  userDataStorage(): UserDataStorage {
    return new UserDataStorageImpl(this.localStorage());
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
