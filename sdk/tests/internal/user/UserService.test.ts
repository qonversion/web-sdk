import {
  ApiInteractor,
  RequestConfigurator,
  NetworkRequest, NetworkResponseError,
  NetworkResponseSuccess
} from '../../../src/internal/network';
import {UserApi, UserService, UserServiceImpl} from '../../../src/internal/user';
import {Environment, QonversionError, QonversionErrorCode, User} from '../../../src';
import {HTTP_CODE_NOT_FOUND} from '../../../src/internal/network/constants';
import {PrimaryConfig} from '../../../src/types';
import {PrimaryConfigProvider} from '../../../src/internal';

let primaryConfig: PrimaryConfig;
let requestConfigurator: RequestConfigurator;
let apiInteractor: ApiInteractor;
let userService: UserService;
const testUserId = 'test user id';

const apiPayload: UserApi = {
  created: 0,
  environment: 'prod',
  id: testUserId,
  identity_id: 'some identity',
};
const testSuccessfulResponse: NetworkResponseSuccess<UserApi> = {
  code: 200,
  data: apiPayload,
  isSuccess: true
};
const testErrorCode = 500;
const testErrorMessage = 'Test error message';
const testErrorResponse: NetworkResponseError = {
  code: testErrorCode,
  apiCode: '',
  message: testErrorMessage,
  type: '',
  isSuccess: false,
};
const expRes: User = {
  created: 0,
  environment: 'prod',
  id: testUserId,
  identityId: 'some identity',
};
const testEnvironment = Environment.Sandbox;

beforeEach(() => {
  // @ts-ignore
  primaryConfig = {
    environment: testEnvironment,
  };
  const primaryConfigProvider: PrimaryConfigProvider = {
    getPrimaryConfig: () => primaryConfig,
  };
  // @ts-ignore
  requestConfigurator = {};
  // @ts-ignore
  apiInteractor = {};

  userService = new UserServiceImpl(primaryConfigProvider, requestConfigurator, apiInteractor);
});

describe('getUser tests', function () {
  // @ts-ignore
  const testRequest: NetworkRequest = {a: 'aa'};

  test('user successfully received', async () => {
    // given
    requestConfigurator.configureUserRequest = jest.fn(() => testRequest);
    // @ts-ignore
    apiInteractor.execute = jest.fn(async () => testSuccessfulResponse);

    // when
    const res = await userService.getUser(testUserId);

    // then
    expect(res).toStrictEqual(expRes);
    expect(requestConfigurator.configureUserRequest).toBeCalledWith(testUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('user request failed', async () => {
    // given
    requestConfigurator.configureUserRequest = jest.fn(() => testRequest);
    apiInteractor.execute = jest.fn(async () => testErrorResponse);
    const expError = new QonversionError(
      QonversionErrorCode.BackendError,
      `Response code ${testErrorCode}, message: ${testErrorMessage}`,
    );

    // when and then
    await expect(() => userService.getUser(testUserId)).rejects.toThrow(expError);
    expect(requestConfigurator.configureUserRequest).toBeCalledWith(testUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('user does not exist', async () => {
    // given
    const testUserNotFoundResponse: NetworkResponseError = {
      code: HTTP_CODE_NOT_FOUND,
      apiCode: '',
      message: testErrorMessage,
      type: '',
      isSuccess: false,
    };
    requestConfigurator.configureUserRequest = jest.fn(() => testRequest);
    apiInteractor.execute = jest.fn(async () => testUserNotFoundResponse);
    const expError = new QonversionError(
      QonversionErrorCode.UserNotFound,
      `Id: ${testUserId}`,
    );

    // when and then
    await expect(() => userService.getUser(testUserId)).rejects.toThrow(expError);
    expect(requestConfigurator.configureUserRequest).toBeCalledWith(testUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });
});

describe('createUser tests', function () {
  // @ts-ignore
  const testRequest: NetworkRequest = {a: 'aa'};

  test('user successfully received', async () => {
    // given
    requestConfigurator.configureCreateUserRequest = jest.fn(() => testRequest);
    // @ts-ignore
    apiInteractor.execute = jest.fn(async () => testSuccessfulResponse);

    // when
    const res = await userService.createUser(testUserId);

    // then
    expect(res).toStrictEqual(expRes);
    expect(requestConfigurator.configureCreateUserRequest).toBeCalledWith(testUserId, testEnvironment);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('user request failed', async () => {
    // given
    requestConfigurator.configureCreateUserRequest = jest.fn(() => testRequest);
    apiInteractor.execute = jest.fn(async () => testErrorResponse);
    const expError = new QonversionError(
      QonversionErrorCode.BackendError,
      `Response code ${testErrorCode}, message: ${testErrorMessage}`,
    );

    // when and then
    await expect(() => userService.createUser(testUserId)).rejects.toThrow(expError);
    expect(requestConfigurator.configureCreateUserRequest).toBeCalledWith(testUserId, testEnvironment);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });
});
