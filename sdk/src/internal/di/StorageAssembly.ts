import {IStorageAssembly} from './types';
import {IUserDataProvider, UserDataStorage, UserDataStorageImpl} from '../user';
import {LocalStorage, LocalStorageImpl, StorageConstants} from '../common';
import {UserPropertiesStorage, UserPropertiesStorageImpl} from '../userProperties';

export class StorageAssembly implements IStorageAssembly {
  private sharedUserDataStorage: UserDataStorage | undefined;
  private sharedPendingUserPropertiesStorage: UserPropertiesStorage | undefined;
  private sharedSentUserPropertiesStorage: UserPropertiesStorage | undefined;

  localStorage(): LocalStorage {
    return new LocalStorageImpl();
  }

  userDataProvider(): IUserDataProvider {
    return this.userDataStorage();
  }

  userDataStorage(): UserDataStorage {
    if (this.sharedUserDataStorage) {
      return this.sharedUserDataStorage;
    }
    this.sharedUserDataStorage = new UserDataStorageImpl(this.localStorage());
    return this.sharedUserDataStorage;
  }

  pendingUserPropertiesStorage(): UserPropertiesStorage {
    if (this.sharedPendingUserPropertiesStorage) {
      return this.sharedPendingUserPropertiesStorage;
    }
    this.sharedPendingUserPropertiesStorage = this.userPropertiesStorage(StorageConstants.PendingUserProperties);
    return this.sharedPendingUserPropertiesStorage;
  }

  sentUserPropertiesStorage(): UserPropertiesStorage {
    if (this.sharedSentUserPropertiesStorage) {
      return this.sharedSentUserPropertiesStorage;
    }
    this.sharedSentUserPropertiesStorage = this.userPropertiesStorage(StorageConstants.SentUserProperties);
    return this.sharedSentUserPropertiesStorage;
  }

  private userPropertiesStorage(key: string): UserPropertiesStorage {
    return new UserPropertiesStorageImpl(this.localStorage(), key);
  }
}
