import {UserControllerImpl, UserDataStorage} from '../../../src/internal/user';
import {Logger} from '../../../src/internal/logger';
import {EntitlementsController, EntitlementsService, EntitlementsControllerImpl} from '../../../src/internal/entitlements';
import {Entitlement, QonversionError, QonversionErrorCode} from '../../../src';

let entitlementsService: EntitlementsService;
let userDataStorage: UserDataStorage;
let logger: Logger;
let userController: UserControllerImpl;
let entitlementsController: EntitlementsController;

const testUserId = 'test user id';
const testEntitlements: Entitlement[] = [{
  active: true,
  started: 1,
  expires: 2,
  id: 'test entitlement 1',
}, {
  active: false,
  started: 100,
  expires: 200,
  id: 'test entitlement 2',
}];

beforeEach(() => {
  // @ts-ignore
  userController = {};
  // @ts-ignore
  entitlementsService = {};
  // @ts-ignore
  userDataStorage = {};
  // @ts-ignore
  logger = {
    info: jest.fn(),
    error: jest.fn(),
  };
  entitlementsController = new EntitlementsControllerImpl(userController, entitlementsService, userDataStorage, logger);
});

describe('getEntitlements tests', () => {
  test('successfully get entitlements', async () => {
    // given
    userDataStorage.requireOriginalUserId = jest.fn(() => testUserId);
    entitlementsService.getEntitlements = jest.fn(async () => testEntitlements);

    // when
    const res = await entitlementsController.getEntitlements();

    // then
    expect(res).toStrictEqual(testEntitlements);
    expect(userDataStorage.requireOriginalUserId).toBeCalled();
    expect(entitlementsService.getEntitlements).toBeCalledWith(testUserId);
    expect(logger.info).toBeCalledWith('Successfully received entitlements', testEntitlements);
  });

  test('unknown error while getting entitlements', async () => {
    // given
    userDataStorage.requireOriginalUserId = jest.fn(() => testUserId);
    const unknownError = new Error('unknown error');
    entitlementsService.getEntitlements = jest.fn(async () => {throw unknownError});

    // when and then
    await expect(entitlementsController.getEntitlements()).rejects.toThrow(unknownError);
    expect(entitlementsService.getEntitlements).toBeCalledWith(testUserId);
    expect(logger.error).toBeCalledWith('Failed to request entitlements', unknownError);
  });

  test('user not found and created successfully', async () => {
    // given
    userDataStorage.requireOriginalUserId = jest.fn(() => testUserId);
    const userNotFoundError = new QonversionError(QonversionErrorCode.UserNotFound);
    entitlementsService.getEntitlements = jest.fn(async () => {throw userNotFoundError});
    // @ts-ignore
    userController.createUser = jest.fn(async () => {});

    // when
    const res = await entitlementsController.getEntitlements();

    // then
    expect(res).toStrictEqual([]);
    expect(entitlementsService.getEntitlements).toBeCalledWith(testUserId);
    expect(logger.info).toBeCalledWith('User is not registered. Creating new one');
    expect(userController.createUser).toBeCalled();
    expect(logger.error).not.toBeCalled();
  });

  test('user not found and creation fails', async () => {
    // given
    userDataStorage.requireOriginalUserId = jest.fn(() => testUserId);
    const userNotFoundError = new QonversionError(QonversionErrorCode.UserNotFound);
    entitlementsService.getEntitlements = jest.fn(async () => {throw userNotFoundError});
    const userCreationError = new QonversionError(QonversionErrorCode.BackendError);
    userController.createUser = jest.fn(async () => {throw userCreationError});

    // when
    const res = await entitlementsController.getEntitlements();

    // then
    expect(res).toStrictEqual([]);
    expect(entitlementsService.getEntitlements).toBeCalledWith(testUserId);
    expect(logger.info).toBeCalledWith('User is not registered. Creating new one');
    expect(userController.createUser).toBeCalled();
    expect(logger.error).toBeCalledWith('Failed to create new user', userCreationError);
  });
});
