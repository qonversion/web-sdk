import {UserDataStorage} from './types';
import {LocalStorage, StorageConstants} from '../common';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

export class UserDataStorageImpl implements UserDataStorage {
  private readonly localStorage: LocalStorage;

  private originalId: string | undefined;

  private identityId: string | undefined;

  constructor(localStorage: LocalStorage) {
    this.localStorage = localStorage;

    this.originalId = localStorage.getString(StorageConstants.OriginalUserId);
    this.identityId = localStorage.getString(StorageConstants.IdentityUserId);
  }

  getUserId(): string | undefined {
    return this.identityId ?? this.originalId;
  }

  requireUserId(): string {
    const id = this.getUserId();
    if (id) {
      return id;
    }

    throw new QonversionError(QonversionErrorCode.UserNotFound, "The user id was required but does not exist.");
  }

  clearIdentityUserId(): void {
    this.localStorage.remove(StorageConstants.IdentityUserId);
    this.identityId = undefined;
  }

  setIdentityUserId(identityUserId: string): void {
    this.localStorage.putString(StorageConstants.IdentityUserId, identityUserId);
    this.identityId = identityUserId;
  }

  setOriginalUserId(originalUserId: string): void {
    this.localStorage.putString(StorageConstants.OriginalUserId, originalUserId);
    this.originalId = originalUserId;
  }
}
