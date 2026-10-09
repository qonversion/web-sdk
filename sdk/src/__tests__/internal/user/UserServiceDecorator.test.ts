import {UserService, UserServiceDecorator} from '../../../internal/user';
import {QonversionError, QonversionErrorCode, User} from '../../../index';

const testUserId = 'test user id';
const testUser: User = {
  created: 0,
  environment: 'sandbox',
  id: testUserId,
  identityId: 'some identity'
};
let userService: UserService;
let userServiceDecorator: UserServiceDecorator;

beforeEach(() => {
  // @ts-ignore
  userService = {};
  userServiceDecorator = new UserServiceDecorator(userService);
});

describe('createUser tests', () => {
  test('create user', async () => {
    // given
    const promise = Promise.resolve(testUser);
    // @ts-ignore
    userService.createUser = jest.fn(() => promise);

    // when
    const res = userServiceDecorator.createUser(testUserId);

    // then
    await expect(res).resolves.toStrictEqual(testUser);
    expect(userService.createUser).toHaveBeenCalledWith(testUserId);
  });
});

describe('getUser tests', () => {
  test('another request is in progress', async () => {
    // given
    const promise = Promise.resolve(testUser);
    // @ts-ignore
    userServiceDecorator['userLoadingPromise'] = promise;

    // when
    const res = userServiceDecorator.getUser(testUserId);

    // then
    await expect(res).resolves.toStrictEqual(testUser);
  });

  test('no request is in progress', async () => {
    // given
    const promise = Promise.resolve(testUser);
    // @ts-ignore
    userServiceDecorator['loadOrCreateUser'] = jest.fn(() => promise);

    // when
    const res = userServiceDecorator.getUser(testUserId);

    // then
    await expect(res).resolves.toStrictEqual(testUser);
    expect(userServiceDecorator['loadOrCreateUser']).toHaveBeenCalledWith(testUserId);
    expect(userServiceDecorator['userLoadingPromise']).toBe(promise);
  });
});

describe('loadOrCreateUser tests', () => {
  test('user already exists', async () => {
    // given
    userService.getUser = jest.fn(async () => testUser);

    // when
    const res = await userServiceDecorator['loadOrCreateUser'](testUserId);

    // then
    expect(res).toStrictEqual(testUser);
    expect(userService.getUser).toHaveBeenCalledWith(testUserId);
  });

  test('user does not exist', async () => {
    // given
    const notFoundError = new QonversionError(QonversionErrorCode.UserNotFound);
    userService.getUser = jest.fn(async () => {throw notFoundError});
    userService.createUser = jest.fn(async () => testUser);

    // when
    const res = await userServiceDecorator['loadOrCreateUser'](testUserId);

    // then
    expect(res).toStrictEqual(testUser);
    expect(userService.getUser).toHaveBeenCalledWith(testUserId);
    expect(userService.createUser).toHaveBeenCalledWith(testUserId);
  });

  test('getUser throws unknown error', async () => {
    // given
    const unknownError = new Error();
    userService.getUser = jest.fn(async () => {throw unknownError});

    // when and then
    await expect(userServiceDecorator['loadOrCreateUser'](testUserId)).rejects.toThrow(unknownError);
    expect(userService.getUser).toHaveBeenCalledWith(testUserId);
  });

  test('createUser throws unknown error', async () => {
    // given
    const unknownError = new Error();
    const notFoundError = new QonversionError(QonversionErrorCode.UserNotFound);
    userService.getUser = jest.fn(async () => {throw notFoundError});
    userService.createUser = jest.fn(async () => {throw unknownError});

    // when and then
    await expect(userServiceDecorator['loadOrCreateUser'](testUserId)).rejects.toThrow(unknownError);
    expect(userService.getUser).toHaveBeenCalledWith(testUserId);
    expect(userService.createUser).toHaveBeenCalledWith(testUserId);
  });
});
