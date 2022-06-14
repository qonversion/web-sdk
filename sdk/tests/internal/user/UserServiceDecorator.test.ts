import {UserService, UserServiceDecorator} from '../../../src/internal/user';
import {QonversionError, QonversionErrorCode, User} from '../../../src';

const testUserId = 'test user id';
let userService: UserService;
let userServiceDecorator: UserServiceDecorator;

beforeEach(() => {
  // @ts-ignore
  userService = {};
  userServiceDecorator = new UserServiceDecorator(userService);
});

describe('createUser tests', () => {
  test('create user', () => {
    // given
    const promise = new Promise(() => {});
    // @ts-ignore
    userService.createUser = jest.fn(() => promise);

    // when
    const res = userServiceDecorator.createUser(testUserId);

    // then
    expect(res).toStrictEqual(promise);
    expect(userService.createUser).toBeCalledWith(testUserId);
  });
});

describe('getUser tests', () => {
  test('another request is in progress', () => {
    // given
    const promise = new Promise(() => {});
    // @ts-ignore
    userServiceDecorator['userLoadingPromise'] = promise;

    // when
    const res = userServiceDecorator.getUser(testUserId);

    // then
    expect(res).toStrictEqual(promise);
  });

  test('no request is in progress', () => {
    // given
    const promise = new Promise(() => {});
    // @ts-ignore
    userServiceDecorator['loadOrCreateUser'] = jest.fn(() => promise);

    // when
    const res = userServiceDecorator.getUser(testUserId);

    // then
    expect(res).toStrictEqual(promise);
    expect(userServiceDecorator['loadOrCreateUser']).toBeCalledWith(testUserId);
    expect(userServiceDecorator['userLoadingPromise']).toStrictEqual(promise);
  });
});

describe('loadOrCreateUser tests', () => {
  const user: User = {
    created: 0,
    environment: 'sandbox',
    id: testUserId,
    identityId: 'some identity'
  };

  test('user already exists', async () => {
    // given
    userService.getUser = jest.fn(async () => user);

    // when
    const res = await userServiceDecorator['loadOrCreateUser'](testUserId);

    // then
    expect(res).toStrictEqual(user);
    expect(userService.getUser).toBeCalledWith(testUserId);
  });

  test('user does not exist', async () => {
    // given
    const notFoundError = new QonversionError(QonversionErrorCode.UserNotFound);
    userService.getUser = jest.fn(async () => {throw notFoundError});
    userService.createUser = jest.fn(async () => user);

    // when
    const res = await userServiceDecorator['loadOrCreateUser'](testUserId);

    // then
    expect(res).toStrictEqual(user);
    expect(userService.getUser).toBeCalledWith(testUserId);
    expect(userService.createUser).toBeCalledWith(testUserId);
  });

  test('getUser throws unknown error', async () => {
    // given
    const unknownError = new Error();
    userService.getUser = jest.fn(async () => {throw unknownError});

    // when and then
    await expect(userServiceDecorator['loadOrCreateUser'](testUserId)).rejects.toThrow(unknownError);
    expect(userService.getUser).toBeCalledWith(testUserId);
  });

  test('createUser throws unknown error', async () => {
    // given
    const unknownError = new Error();
    const notFoundError = new QonversionError(QonversionErrorCode.UserNotFound);
    userService.getUser = jest.fn(async () => {throw notFoundError});
    userService.createUser = jest.fn(async () => {throw unknownError});

    // when and then
    await expect(userServiceDecorator['loadOrCreateUser'](testUserId)).rejects.toThrow(unknownError);
    expect(userService.getUser).toBeCalledWith(testUserId);
    expect(userService.createUser).toBeCalledWith(testUserId);
  });
});
