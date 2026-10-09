import {UserControllerImpl, UserDataStorage} from '../../../internal/user';
import {Logger} from '../../../internal/logger';
import {EntitlementsController, EntitlementsService, EntitlementsControllerImpl} from '../../../internal/entitlements';
import {Entitlement, QonversionError, QonversionErrorCode} from '../../../index';

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
    verbose: jest.fn(),
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
    expect(userDataStorage.requireOriginalUserId).toHaveBeenCalled();
    expect(entitlementsService.getEntitlements).toHaveBeenCalledWith(testUserId);
    expect(logger.verbose).toHaveBeenCalledWith('Requesting entitlements', {userId: testUserId});
    expect(logger.info).toHaveBeenCalledWith('Successfully received entitlements', testEntitlements);
  });

  test('unknown error while getting entitlements', async () => {
    // given
    userDataStorage.requireOriginalUserId = jest.fn(() => testUserId);
    const unknownError = new Error('unknown error');
    entitlementsService.getEntitlements = jest.fn(async () => {throw unknownError});

    // when and then
    await expect(entitlementsController.getEntitlements()).rejects.toThrow(unknownError);
    expect(entitlementsService.getEntitlements).toHaveBeenCalledWith(testUserId);
    expect(logger.verbose).toHaveBeenCalledWith('Requesting entitlements', {userId: testUserId});
    expect(logger.error).toHaveBeenCalledWith('Failed to request entitlements', unknownError);
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
    expect(entitlementsService.getEntitlements).toHaveBeenCalledWith(testUserId);
    expect(logger.verbose).toHaveBeenCalledWith('Requesting entitlements', {userId: testUserId});
    expect(logger.verbose).toHaveBeenCalledWith('User is not registered. Creating new one');
    expect(userController.createUser).toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
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
    expect(entitlementsService.getEntitlements).toHaveBeenCalledWith(testUserId);
    expect(logger.verbose).toHaveBeenCalledWith('Requesting entitlements', {userId: testUserId});
    expect(logger.verbose).toHaveBeenCalledWith('User is not registered. Creating new one');
    expect(logger.error).toHaveBeenCalledWith('Failed to create new user while requesting entitlements', userCreationError);
    expect(userController.createUser).toHaveBeenCalled();
  });
});
