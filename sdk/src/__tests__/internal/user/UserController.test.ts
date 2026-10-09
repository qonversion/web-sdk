import {
  IdentityService, UserChangedListener,
  UserControllerImpl,
  UserDataStorage,
  UserIdGenerator,
  UserService
} from '../../../internal/user';
import {Logger} from '../../../internal/logger';
import {QonversionError, QonversionErrorCode, User} from '../../../index';

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
    getIdentityUserId: jest.fn(() => testIdentityUserId),
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
    expect(userDataStorage.getOriginalUserId).toHaveBeenCalled();
    expect(userIdGenerator.generate).not.toHaveBeenCalled();
    expect(userDataStorage.setOriginalUserId).not.toHaveBeenCalled();
  });

  test('user id does not exist', () => {
    // given
    userDataStorage.getOriginalUserId = jest.fn(() => undefined);

    // when
    userController = new UserControllerImpl(userService, identityService, userDataStorage, userIdGenerator, logger);

    // then
    expect(userDataStorage.getOriginalUserId).toHaveBeenCalled();
    expect(userIdGenerator.generate).toHaveBeenCalled();
    expect(userDataStorage.setOriginalUserId).toHaveBeenCalledWith(testNewQonversionUserId);
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
    expect(userDataStorage.requireOriginalUserId).toHaveBeenCalled();
    expect(userService.getUser).toHaveBeenCalledWith(testQonversionUserId);
    expect(logger.verbose).toHaveBeenCalledWith('Sending user request', {userId: testQonversionUserId});
    expect(logger.info).toHaveBeenCalledWith('User info was successfully received from API', testUser);
    expect(logger.error).not.toHaveBeenCalled();
  });

  test('user id does not exist', async () => {
    // given
    const noUserIdError = new QonversionError(QonversionErrorCode.UserNotFound);
    userDataStorage.requireOriginalUserId = jest.fn(() => {throw noUserIdError});

    // when and then
    await expect(userController.getUser()).rejects.toThrow(noUserIdError);
    expect(userDataStorage.requireOriginalUserId).toHaveBeenCalled();
    expect(userService.getUser).not.toHaveBeenCalled();
    expect(logger.verbose).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Failed to get User from API', noUserIdError);
  });

  test('user request fails with error', async () => {
    // given
    const userRequestError = new QonversionError(QonversionErrorCode.BackendError);
    userDataStorage.requireOriginalUserId = jest.fn(() => testQonversionUserId);
    userService.getUser = jest.fn(async () => {throw userRequestError});

    // when and then
    await expect(userController.getUser()).rejects.toThrow(userRequestError);
    expect(userDataStorage.requireOriginalUserId).toHaveBeenCalled();
    expect(userService.getUser).toHaveBeenCalledWith(testQonversionUserId);
    expect(logger.verbose).toHaveBeenCalledWith('Sending user request', {userId: testQonversionUserId});
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Failed to get User from API', userRequestError);
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
    expect(userDataStorage.getIdentityUserId).toHaveBeenCalled();
    expect(identityService.obtainIdentity).not.toHaveBeenCalled();
    expect(userController['handleSuccessfulIdentity']).not.toHaveBeenCalled();
    expect(logger.verbose).toHaveBeenCalledWith('Current user has the same identity id', {identityId: testIdentityUserId});
  });

  test('existing identity', async () => {
    // given
    identityService.obtainIdentity = jest.fn(async () => testNewQonversionUserId);
    identityService.createIdentity = jest.fn(async () => testNewQonversionUserId);

    // when
    await userController.identify(testIdentityUserId);

    // then
    expect(userDataStorage.getIdentityUserId).toHaveBeenCalled();
    expect(identityService.obtainIdentity).toHaveBeenCalledWith(testIdentityUserId);
    expect(userController['handleSuccessfulIdentity']).toHaveBeenCalledWith(testNewQonversionUserId, testIdentityUserId);
    expect(identityService.createIdentity).not.toHaveBeenCalled();
    expect(logger.verbose).toHaveBeenCalledWith('Checking for existing user with the given identity id', {identityId: testIdentityUserId});
  });

  test('obtainIdentity throws unknown error', async () => {
    // given
    const unknownError = new Error('something unknown happened');
    identityService.obtainIdentity = jest.fn(async () => {throw unknownError});

    // when and then
    await expect(() => userController.identify(testIdentityUserId)).rejects.toThrow(unknownError);
    expect(userDataStorage.getIdentityUserId).toHaveBeenCalled();
    expect(logger.verbose).toHaveBeenCalledWith('Checking for existing user with the given identity id', {identityId: testIdentityUserId});
    expect(logger.error).toHaveBeenCalledWith(`Failed to identify user with id ${testIdentityUserId}`, unknownError);
    expect(userController['handleSuccessfulIdentity']).not.toHaveBeenCalled();
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
    expect(userDataStorage.getIdentityUserId).toHaveBeenCalled();
    expect(identityService.obtainIdentity).toHaveBeenCalledWith(testIdentityUserId);
    expect(userDataStorage.requireOriginalUserId).toHaveBeenCalled();
    expect(identityService.createIdentity).toHaveBeenCalledWith(testQonversionUserId, testIdentityUserId);
    expect(userController['handleSuccessfulIdentity']).toHaveBeenCalledWith(testNewQonversionUserId, testIdentityUserId);
    expect(logger.verbose).toHaveBeenCalledWith('Checking for existing user with the given identity id', {identityId: testIdentityUserId});
    expect(logger.verbose).toHaveBeenCalledWith('No user found with the given identity id, linking current one', {userId: testQonversionUserId, identityId: testIdentityUserId});
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
    expect(userDataStorage.getIdentityUserId).toHaveBeenCalled();
    expect(identityService.obtainIdentity).toHaveBeenCalledWith(testIdentityUserId);
    expect(userDataStorage.requireOriginalUserId).toHaveBeenCalled();
    expect(identityService.createIdentity).toHaveBeenCalledWith(testQonversionUserId, testIdentityUserId);
    expect(logger.verbose).toHaveBeenCalledWith('Checking for existing user with the given identity id', {identityId: testIdentityUserId});
    expect(logger.verbose).toHaveBeenCalledWith('No user found with the given identity id, linking current one', {userId: testQonversionUserId, identityId: testIdentityUserId});
    expect(logger.error).toHaveBeenCalledWith(`Failed to create user identity for id ${testIdentityUserId}`, creationError);
    expect(userController['handleSuccessfulIdentity']).not.toHaveBeenCalled();
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
    expect(userController['createUser']).not.toHaveBeenCalled();
    expect(logger.verbose).toHaveBeenCalledWith('No user is identified, no need to logout');
  });

  test('successful logout', async () => {
    // given
    userDataStorage.getIdentityUserId = jest.fn(() => testIdentityUserId);
    userController['createUser'] = jest.fn(async () => testUser);

    // when
    await userController.logout();

    // then
    expect(userController['createUser']).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('Logout is completed. A new user is successfully created.');
    expect(logger.error).not.toHaveBeenCalled();
  });

  test('logout fails', async () => {
    // given
    userDataStorage.getIdentityUserId = jest.fn(() => testIdentityUserId);
    const error = new QonversionError(QonversionErrorCode.BackendError);
    userController['createUser'] = jest.fn(async () => {throw error});

    // when
    await expect(() => userController.logout()).rejects.toThrow(error);
    expect(userController['createUser']).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Failed to create new user after logout.', error);
    expect(logger.info).not.toHaveBeenCalled();
  });
});

describe('createUser tests', function () {
  test('simple user creation', async () => {
    // given
    userIdGenerator.generate = jest.fn(() => testNewQonversionUserId);
    userController['fireUserChangedEvent'] = jest.fn();

    // when
    const user = await userController['createUser']();

    // then
    expect(user).toStrictEqual(testUser);
    expect(userDataStorage.getOriginalUserId).toHaveBeenCalled();
    expect(userDataStorage.getIdentityUserId).toHaveBeenCalled();
    expect(userDataStorage.clearIdentityUserId).toHaveBeenCalled();
    expect(userIdGenerator.generate).toHaveBeenCalled();
    expect(userDataStorage.setOriginalUserId).toHaveBeenCalledWith(testNewQonversionUserId);
    expect(userService.createUser).toHaveBeenCalledWith(testNewQonversionUserId);
    expect(logger.verbose).toHaveBeenCalledWith('Creating new user', {userId: testNewQonversionUserId});
    expect(userController['fireUserChangedEvent']).toHaveBeenCalledWith(testNewQonversionUserId, testQonversionUserId, testIdentityUserId);
  });
});

describe('handleSuccessfulIdentity tests', function () {
  test('handle successful identity', () => {
    // given
    const oldIdentityId = 'test old identity id';
    userDataStorage.getIdentityUserId = jest.fn(() => oldIdentityId);
    userController['fireUserChangedEvent'] = jest.fn();

    // when
    userController['handleSuccessfulIdentity'](testNewQonversionUserId, testIdentityUserId);

    // then
    expect(userDataStorage.getOriginalUserId).toHaveBeenCalled();
    expect(userDataStorage.getIdentityUserId).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(`User with id ${testIdentityUserId} is successfully identified.`);
    expect(userDataStorage.setOriginalUserId).toHaveBeenCalledWith(testNewQonversionUserId);
    expect(userDataStorage.setIdentityUserId).toHaveBeenCalledWith(testIdentityUserId);
    expect(userController['fireUserChangedEvent']).toHaveBeenCalledWith(testNewQonversionUserId, testQonversionUserId, oldIdentityId);
  });
});

describe('fireUserChangedEvent tests', function () {
  test('original id didn\'t change', () => {
    // given
    const listener: UserChangedListener = {
      onUserChanged: jest.fn(),
    }
    userController['userChangedListeners'] = [listener];

    // when
    userController['fireUserChangedEvent'](testQonversionUserId, testQonversionUserId);

    // then
    expect(listener.onUserChanged).not.toHaveBeenCalled();
  });
  test('original id changed', () => {
    // given
    const listener: UserChangedListener = {
      onUserChanged: jest.fn(),
    }
    userController['userChangedListeners'] = [listener];

    // when
    userController['fireUserChangedEvent'](testNewQonversionUserId, testQonversionUserId, testIdentityUserId);

    // then
    expect(listener.onUserChanged).toHaveBeenCalledWith(testNewQonversionUserId, testQonversionUserId, testIdentityUserId);
  });
});

describe('subscribeOnUserChanges tests', function () {
  test('subscribing listener', () => {
    // given
    const listener: UserChangedListener = {
      onUserChanged: jest.fn(),
    }
    userController['userChangedListeners'] = [];

    // when
    userController.subscribeOnUserChanges(listener);

    // then
    expect(userController['userChangedListeners']).toStrictEqual([listener]);
  });
});
