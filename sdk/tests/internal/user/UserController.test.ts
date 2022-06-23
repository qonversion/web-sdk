import {
  IdentityService,
  UserControllerImpl,
  UserDataStorage,
  UserIdGenerator,
  UserService
} from '../../../src/internal/user';
import {Logger} from '../../../src/internal/logger';
import {QonversionError, QonversionErrorCode, User} from '../../../src';

let userService: UserService;
let identityService: IdentityService;
let userDataStorage: UserDataStorage;
let userIdGenerator: UserIdGenerator;
let logger: Logger;
let userController: UserControllerImpl;

const testQonversionUserId = 'test qonversion user id';
const testNewQonversionUserId = 'test new qonversion user id';
const testIdentityUserId = 'test identity user id';
// @ts-ignore
const testUser: User = {
  id: testQonversionUserId,
};

beforeEach(() => {
  userService = {
    getUser: jest.fn(async () => testUser),
    createUser: jest.fn(async () => testUser),
  };
  // @ts-ignore
  identityService = {};
  // @ts-ignore
  userDataStorage = {
    getOriginalUserId: jest.fn(() => testQonversionUserId),
    clearIdentityUserId: jest.fn(),
    setOriginalUserId: jest.fn(),
    setIdentityUserId: jest.fn(),
  };
  // @ts-ignore
  userIdGenerator = {};
  // @ts-ignore
  logger = {
    verbose: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  };
  userController = new UserControllerImpl(userService, identityService, userDataStorage, userIdGenerator, logger);
});

describe('constructor tests', function () {
  beforeEach(() => {
    userIdGenerator.generate = jest.fn(() => testNewQonversionUserId);
    userDataStorage.setOriginalUserId = jest.fn();
  });

  test('user id exists', () => {
    // given

    // when
    userController = new UserControllerImpl(userService, identityService, userDataStorage, userIdGenerator, logger);

    // then
    expect(userDataStorage.getOriginalUserId).toBeCalled();
    expect(userIdGenerator.generate).not.toBeCalled();
    expect(userDataStorage.setOriginalUserId).not.toBeCalled();
  });

  test('user id does not exist', () => {
    // given
    userDataStorage.getOriginalUserId = jest.fn(() => undefined);

    // when
    userController = new UserControllerImpl(userService, identityService, userDataStorage, userIdGenerator, logger);

    // then
    expect(userDataStorage.getOriginalUserId).toBeCalled();
    expect(userIdGenerator.generate).toBeCalled();
    expect(userDataStorage.setOriginalUserId).toBeCalledWith(testNewQonversionUserId);
  });
});

describe('getUser tests', function () {
  test('get existing user', async () => {
    // given
    userDataStorage.requireOriginalUserId = jest.fn(() => testQonversionUserId);

    // when
    const res = await userController.getUser();

    // then
    expect(res).toStrictEqual(testUser);
    expect(userDataStorage.requireOriginalUserId).toBeCalled();
    expect(userService.getUser).toBeCalledWith(testQonversionUserId);
    expect(logger.verbose).toBeCalledWith('Sending user request', {userId: testQonversionUserId});
    expect(logger.info).toBeCalledWith('User info was successfully received from API', testUser);
    expect(logger.error).not.toBeCalled();
  });

  test('user id does not exist', async () => {
    // given
    const noUserIdError = new QonversionError(QonversionErrorCode.UserNotFound);
    userDataStorage.requireOriginalUserId = jest.fn(() => {throw noUserIdError});

    // when and then
    await expect(userController.getUser()).rejects.toThrow(noUserIdError);
    expect(userDataStorage.requireOriginalUserId).toBeCalled();
    expect(userService.getUser).not.toBeCalled();
    expect(logger.verbose).not.toBeCalled();
    expect(logger.info).not.toBeCalled();
    expect(logger.error).toBeCalledWith('Failed to get User from API', noUserIdError);
  });

  test('user request fails with error', async () => {
    // given
    const userRequestError = new QonversionError(QonversionErrorCode.BackendError);
    userDataStorage.requireOriginalUserId = jest.fn(() => testQonversionUserId);
    userService.getUser = jest.fn(async () => {throw userRequestError});

    // when and then
    await expect(userController.getUser()).rejects.toThrow(userRequestError);
    expect(userDataStorage.requireOriginalUserId).toBeCalled();
    expect(userService.getUser).toBeCalledWith(testQonversionUserId);
    expect(logger.verbose).toBeCalledWith('Sending user request', {userId: testQonversionUserId});
    expect(logger.info).not.toBeCalled();
    expect(logger.error).toBeCalledWith('Failed to get User from API', userRequestError);
  });
});

describe('identify tests', function () {
  beforeEach(() => {
    userController['handleSuccessfulIdentity'] = jest.fn();
    userDataStorage.getIdentityUserId = jest.fn(() => undefined);
  });

  test('repeating identify', async () => {
    // given
    userDataStorage.getIdentityUserId = jest.fn(() => testIdentityUserId);
    identityService.obtainIdentity = jest.fn(async () => testNewQonversionUserId);

    // when
    await userController.identify(testIdentityUserId);

    // then
    expect(userDataStorage.getIdentityUserId).toBeCalled();
    expect(identityService.obtainIdentity).not.toBeCalled();
    expect(userController['handleSuccessfulIdentity']).not.toBeCalled();
    expect(logger.verbose).toBeCalledWith('Current user has the same identity id', {identityId: testIdentityUserId});
  });

  test('existing identity', async () => {
    // given
    identityService.obtainIdentity = jest.fn(async () => testNewQonversionUserId);
    identityService.createIdentity = jest.fn(async () => testNewQonversionUserId);

    // when
    await userController.identify(testIdentityUserId);

    // then
    expect(userDataStorage.getIdentityUserId).toBeCalled();
    expect(identityService.obtainIdentity).toBeCalledWith(testIdentityUserId);
    expect(userController['handleSuccessfulIdentity']).toBeCalledWith(testNewQonversionUserId, testIdentityUserId);
    expect(identityService.createIdentity).not.toBeCalled();
    expect(logger.verbose).toBeCalledWith('Checking for existing user with the given identity id', {identityId: testIdentityUserId});
  });

  test('obtainIdentity throws unknown error', async () => {
    // given
    const unknownError = new Error('something unknown happened');
    identityService.obtainIdentity = jest.fn(async () => {throw unknownError});

    // when and then
    await expect(() => userController.identify(testIdentityUserId)).rejects.toThrow(unknownError);
    expect(userDataStorage.getIdentityUserId).toBeCalled();
    expect(logger.verbose).toBeCalledWith('Checking for existing user with the given identity id', {identityId: testIdentityUserId});
    expect(logger.error).toBeCalledWith(`Failed to identify user with id ${testIdentityUserId}`, unknownError);
    expect(userController['handleSuccessfulIdentity']).not.toBeCalled();
  });

  test('identity not found', async () => {
    // given
    const notFoundError = new QonversionError(QonversionErrorCode.IdentityNotFound);
    identityService.obtainIdentity = jest.fn(async () => {throw notFoundError});
    identityService.createIdentity = jest.fn(async () => testNewQonversionUserId);
    userDataStorage.requireOriginalUserId = jest.fn(() => testQonversionUserId);

    // when
    await userController.identify(testIdentityUserId);

    // then
    expect(userDataStorage.getIdentityUserId).toBeCalled();
    expect(identityService.obtainIdentity).toBeCalledWith(testIdentityUserId);
    expect(userDataStorage.requireOriginalUserId).toBeCalled();
    expect(identityService.createIdentity).toBeCalledWith(testQonversionUserId, testIdentityUserId);
    expect(userController['handleSuccessfulIdentity']).toBeCalledWith(testNewQonversionUserId, testIdentityUserId);
    expect(logger.verbose).toBeCalledWith('Checking for existing user with the given identity id', {identityId: testIdentityUserId});
    expect(logger.verbose).toBeCalledWith('No user found with the given identity id, linking current one', {userId: testQonversionUserId, identityId: testIdentityUserId});
  });

  test('identity not found, but creation fails', async () => {
    // given
    const notFoundError = new QonversionError(QonversionErrorCode.IdentityNotFound);
    identityService.obtainIdentity = jest.fn(async () => {throw notFoundError});
    const creationError = new QonversionError(QonversionErrorCode.BackendError);
    identityService.createIdentity = jest.fn(async () => {throw creationError});
    userDataStorage.requireOriginalUserId = jest.fn(() => testQonversionUserId);

    // when and then
    await expect(() => userController.identify(testIdentityUserId)).rejects.toThrow(creationError);
    expect(userDataStorage.getIdentityUserId).toBeCalled();
    expect(identityService.obtainIdentity).toBeCalledWith(testIdentityUserId);
    expect(userDataStorage.requireOriginalUserId).toBeCalled();
    expect(identityService.createIdentity).toBeCalledWith(testQonversionUserId, testIdentityUserId);
    expect(logger.verbose).toBeCalledWith('Checking for existing user with the given identity id', {identityId: testIdentityUserId});
    expect(logger.verbose).toBeCalledWith('No user found with the given identity id, linking current one', {userId: testQonversionUserId, identityId: testIdentityUserId});
    expect(logger.error).toBeCalledWith(`Failed to create user identity for id ${testIdentityUserId}`, creationError);
    expect(userController['handleSuccessfulIdentity']).not.toBeCalled();
  });
});

describe('logout tests', function () {
  test('logout is not needed', async () => {
    // given
    userDataStorage.getIdentityUserId = jest.fn(() => undefined);
    userController['createUser'] = jest.fn(async () => testUser);

    // when
    await userController.logout();

    // then
    expect(userController['createUser']).not.toBeCalled();
    expect(logger.verbose).toBeCalledWith('No user is identified, no need to logout');
  });

  test('successful logout', async () => {
    // given
    userDataStorage.getIdentityUserId = jest.fn(() => testIdentityUserId);
    userController['createUser'] = jest.fn(async () => testUser);

    // when
    await userController.logout();

    // then
    expect(userController['createUser']).toBeCalled();
    expect(logger.info).toBeCalledWith('Logout is completed. A new user is successfully created.');
    expect(logger.error).not.toBeCalled();
  });

  test('logout fails', async () => {
    // given
    userDataStorage.getIdentityUserId = jest.fn(() => testIdentityUserId);
    const error = new QonversionError(QonversionErrorCode.BackendError);
    userController['createUser'] = jest.fn(async () => {throw error});

    // when
    await expect(() => userController.logout()).rejects.toThrow(error);
    expect(userController['createUser']).toBeCalled();
    expect(logger.error).toBeCalledWith('Failed to create new user after logout.', error);
    expect(logger.info).not.toBeCalled();
  });
});

describe('createUser tests', function () {
  test('simple user creation', async () => {
    // given
    userIdGenerator.generate = jest.fn(() => testNewQonversionUserId);

    // when
    const user = await userController['createUser']();

    // then
    expect(user).toStrictEqual(testUser);
    expect(userDataStorage.clearIdentityUserId).toBeCalled();
    expect(userIdGenerator.generate).toBeCalled();
    expect(userDataStorage.setOriginalUserId).toBeCalledWith(testNewQonversionUserId);
    expect(userService.createUser).toBeCalledWith(testNewQonversionUserId);
    expect(logger.verbose).toBeCalledWith('Creating new user', {userId: testNewQonversionUserId});
  });
});

describe('handleSuccessfulIdentity tests', function () {
  test('handle successful identity', () => {
    // given

    // when
    userController['handleSuccessfulIdentity'](testQonversionUserId, testIdentityUserId);

    // then
    expect(logger.info).toBeCalledWith(`User with id ${testIdentityUserId} is successfully identified.`);
    expect(userDataStorage.setOriginalUserId).toBeCalledWith(testQonversionUserId);
    expect(userDataStorage.setIdentityUserId).toBeCalledWith(testIdentityUserId);
  });
});
