import {
  ApiInteractor,
  RequestConfigurator, NetworkRequest,
  NetworkResponseError,
  NetworkResponseSuccess
} from '../../../internal/network';
import {QonversionError, QonversionErrorCode} from '../../../index';
import {HTTP_CODE_NOT_FOUND} from '../../../internal/network/constants';
import {IdentityApi, IdentityService, IdentityServiceImpl} from '../../../internal/user';

let requestConfigurator: RequestConfigurator;
let apiInteractor: ApiInteractor;
let identityService: IdentityService;
const testQonversionUserId = 'test qonversion user id';
const testIdentityUserId = 'test identity user id';

const apiPayload: IdentityApi = {
  user_id: testQonversionUserId,
};
const testSuccessfulResponse: NetworkResponseSuccess<IdentityApi> = {
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

beforeEach(() => {
  // @ts-ignore
  requestConfigurator = {};
  // @ts-ignore
  apiInteractor = {};

  identityService = new IdentityServiceImpl(requestConfigurator, apiInteractor);
});

describe('obtainIdentity tests', function () {
  // @ts-ignore
  const testRequest: NetworkRequest = {a: 'aa'};

  test('identity successfully obtained', async () => {
    // given
    requestConfigurator.configureIdentityRequest = jest.fn(() => testRequest);
    // @ts-ignore
    apiInteractor.execute = jest.fn(async () => testSuccessfulResponse);

    // when
    const res = await identityService.obtainIdentity(testIdentityUserId);

    // then
    expect(res).toStrictEqual(testQonversionUserId);
    expect(requestConfigurator.configureIdentityRequest).toBeCalledWith(testIdentityUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('identity request failed', async () => {
    // given
    requestConfigurator.configureIdentityRequest = jest.fn(() => testRequest);
    apiInteractor.execute = jest.fn(async () => testErrorResponse);
    const expError = new QonversionError(
      QonversionErrorCode.BackendError,
      `Response code ${testErrorCode}, message: ${testErrorMessage}`,
    );

    // when and then
    await expect(() => identityService.obtainIdentity(testIdentityUserId)).rejects.toThrow(expError);
    expect(requestConfigurator.configureIdentityRequest).toBeCalledWith(testIdentityUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('identity does not exist', async () => {
    // given
    const testUserNotFoundResponse: NetworkResponseError = {
      code: HTTP_CODE_NOT_FOUND,
      apiCode: '',
      message: testErrorMessage,
      type: '',
      isSuccess: false,
    };
    requestConfigurator.configureIdentityRequest = jest.fn(() => testRequest);
    apiInteractor.execute = jest.fn(async () => testUserNotFoundResponse);
    const expError = new QonversionError(
      QonversionErrorCode.IdentityNotFound,
      `Id: ${testIdentityUserId}`,
    );

    // when and then
    await expect(() => identityService.obtainIdentity(testIdentityUserId)).rejects.toThrow(expError);
    expect(requestConfigurator.configureIdentityRequest).toBeCalledWith(testIdentityUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });
});

describe('createIdentity tests', function () {
  // @ts-ignore
  const testRequest: NetworkRequest = {a: 'aa'};

  test('identity successfully received', async () => {
    // given
    requestConfigurator.configureCreateIdentityRequest = jest.fn(() => testRequest);
    // @ts-ignore
    apiInteractor.execute = jest.fn(async () => testSuccessfulResponse);

    // when
    const res = await identityService.createIdentity(testQonversionUserId, testIdentityUserId);

    // then
    expect(res).toStrictEqual(testQonversionUserId);
    expect(requestConfigurator.configureCreateIdentityRequest).toBeCalledWith(testQonversionUserId, testIdentityUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('user request failed', async () => {
    // given
    requestConfigurator.configureCreateIdentityRequest = jest.fn(() => testRequest);
    apiInteractor.execute = jest.fn(async () => testErrorResponse);
    const expError = new QonversionError(
      QonversionErrorCode.BackendError,
      `Response code ${testErrorCode}, message: ${testErrorMessage}`,
    );

    // when and then
    await expect(() => identityService.createIdentity(testQonversionUserId, testIdentityUserId)).rejects.toThrow(expError);
    expect(requestConfigurator.configureCreateIdentityRequest).toBeCalledWith(testQonversionUserId, testIdentityUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });
});
