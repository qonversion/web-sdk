import {UserDataStorageImpl} from '../../../src/internal/user';
import {LocalStorage, StorageConstants} from '../../../src/internal/common';
import {QonversionError} from '../../../src';

describe('UserDataStorage tests', () => {
  let userDataStorage: UserDataStorageImpl;
  let localStorage: LocalStorage;

  const testIdentityId = 'test identity id';
  const testOriginalId = 'test original id';

  beforeEach(() => {
    // @ts-ignore
    localStorage = {
      getString: jest.fn(key => key === StorageConstants.OriginalUserId ? testOriginalId : testIdentityId),
    };

    userDataStorage = new UserDataStorageImpl(localStorage);
  });

  test('initialization', () => {
    // given

    // when
    // constructor call in beforeEach

    // then
    expect(localStorage.getString).toBeCalledWith(StorageConstants.OriginalUserId);
    expect(localStorage.getString).toBeCalledWith(StorageConstants.IdentityUserId);
    expect(userDataStorage['originalId']).toBe(testOriginalId);
    expect(userDataStorage['identityId']).toBe(testIdentityId);
  });

  test('get original user id', () => {
    // given
    userDataStorage['originalId'] = testOriginalId;
    userDataStorage['identityId'] = undefined;

    // when
    const res = userDataStorage.getOriginalUserId();

    // then
    expect(res).toBe(testOriginalId);
  });

  test('get identity user id', () => {
    // given
    userDataStorage['originalId'] = undefined;
    userDataStorage['identityId'] = testIdentityId;

    // when
    const res = userDataStorage.getIdentityUserId();

    // then
    expect(res).toBe(testIdentityId);
  });

  test('require original user id when original id exist', () => {
    // given
    userDataStorage['originalId'] = testOriginalId;

    // when
    const res = userDataStorage.requireOriginalUserId();

    // then
    expect(res).toBe(testOriginalId);
  });

  test('require user id when original id does not exist', () => {
    // given
    userDataStorage['originalId'] = undefined;

    // when and then
    expect(() => {
      userDataStorage.requireOriginalUserId();
    }).toThrow(QonversionError);
  });

  test('clear identity id', () => {
    // given
    localStorage.remove = jest.fn();
    userDataStorage['identityId'] = testIdentityId;

    // when
    userDataStorage.clearIdentityUserId();

    // then
    expect(userDataStorage['identityId']).toBeUndefined();
    expect(localStorage.remove).toBeCalledWith(StorageConstants.IdentityUserId);
  });

  test('set identity id', () => {
    // given
    localStorage.putString = jest.fn();
    userDataStorage['identityId'] = undefined;

    // when
    userDataStorage.setIdentityUserId(testIdentityId);

    // then
    expect(userDataStorage['identityId']).toBe(testIdentityId);
    expect(localStorage.putString).toBeCalledWith(StorageConstants.IdentityUserId, testIdentityId);
  });

  test('set original id', () => {
    // given
    localStorage.putString = jest.fn();
    userDataStorage['originalId'] = undefined;

    // when
    userDataStorage.setOriginalUserId(testOriginalId);

    // then
    expect(userDataStorage['originalId']).toBe(testOriginalId);
    expect(localStorage.putString).toBeCalledWith(StorageConstants.OriginalUserId, testOriginalId);
  });
});
