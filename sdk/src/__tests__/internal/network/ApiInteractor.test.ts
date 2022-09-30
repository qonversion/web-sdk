import {
  ApiError,
  ApiInteractorImpl,
  ExponentialDelayCalculator,
  NetworkClientImpl,
  NetworkRequest,
  NetworkResponseError,
  NetworkResponseSuccess,
  NetworkRetryConfig,
  RawNetworkResponse,
  RequestType,
  RetryPolicyExponential,
  RetryPolicyInfiniteExponential,
  RetryPolicyNone
} from '../../../internal/network';
import {NetworkConfigHolder} from '../../../internal';
import {QonversionError, QonversionErrorCode} from '../../../index';
import * as NetworkUtils from '../../../internal/network/utils';

let apiInteractor: ApiInteractorImpl;
let delayCalculator: ExponentialDelayCalculator;
let networkClient: NetworkClientImpl;
let networkConfigHolder: NetworkConfigHolder;
let canSendRequests = true;

beforeEach(() => {
  networkClient = new NetworkClientImpl();
  delayCalculator = new ExponentialDelayCalculator();

  networkConfigHolder = {
    canSendRequests(): boolean {
      return canSendRequests;
    },
    setCanSendRequests(canSend: boolean): void {
      canSendRequests = canSend;
    }
  };

  apiInteractor = new ApiInteractorImpl(networkClient, delayCalculator, networkConfigHolder);
});

describe('execute tests', () => {
  const request: NetworkRequest = {
    headers: {},
    type: RequestType.GET,
    url: '',
  };

  let testResponseCode = 200;
  let testPayload = {
    a: 'a',
    b: 'b',
  };
  let rawSuccessResponse: RawNetworkResponse = {
    code: testResponseCode,
    payload: testPayload,
  };
  let errorResponse: NetworkResponseError = {
    apiCode: '',
    code: 0,
    message: '',
    type: '',
    isSuccess: false,
  }
  let retryConfig: NetworkRetryConfig;

  // @ts-ignore
  let savedGetErrorResponse;

  beforeAll(() => {
    jest.spyOn(NetworkUtils, 'delay').mockImplementation(async () => {});

    savedGetErrorResponse = ApiInteractorImpl.getErrorResponse;
  });

  beforeEach(() => {
    retryConfig = {
      attemptIndex: 0,
      delay: 0,
      shouldRetry: false,
    };

    networkClient.execute = jest.fn(async () => {return rawSuccessResponse});
    apiInteractor.prepareRetryConfig = jest.fn(() => retryConfig);
    ApiInteractorImpl.getErrorResponse = jest.fn(() => errorResponse);
  });

  afterAll(() => {
    // @ts-ignore
    ApiInteractorImpl.getErrorResponse = savedGetErrorResponse;
  });

  test('execute with successful response', async () => {
    // given
    const expResponse: NetworkResponseSuccess<typeof testPayload> = {
      code: testResponseCode,
      data: testPayload,
      isSuccess: true,
    };

    // when
    const response = await apiInteractor.execute(request);

    // then
    expect(response).toStrictEqual(expResponse);
    expect(networkClient.execute).toBeCalledWith(request);
    expect(apiInteractor.prepareRetryConfig).not.toBeCalled();
    expect(ApiInteractorImpl.getErrorResponse).not.toBeCalled();
  });

  test('execute request with deny option on', () => {
    // given
    canSendRequests = false

    // when and then
    expect(async () => {
      await apiInteractor.execute(request);
    }).rejects.toThrow(QonversionError);

    canSendRequests = true
  });

  test('network client throws non retryable error', () => {
    // given
    const expectedError = new Error('non retryable error');
    networkClient.execute = jest.fn(() => {
      throw expectedError;
    });

    // when and then
    expect(async () => {
      await apiInteractor.execute(request);
    }).rejects.toThrow(expectedError);
  });

  test('network client throws retryable error', async () => {
    // given
    const retryCount = 3;
    const expectedError = new QonversionError(QonversionErrorCode.ConfigPreparation);
    networkClient.execute = jest.fn(() => {throw expectedError});
    ApiInteractorImpl.getErrorResponse = jest.fn((response, error) => {throw error});
    apiInteractor.prepareRetryConfig = jest.fn((retryPolicy, attemptIndex) => ({
      attemptIndex: attemptIndex + 1,
      delay: 1,
      shouldRetry: attemptIndex < retryCount,
    }));

    // when and then
    await expect(async () => {
      await apiInteractor.execute(request, new RetryPolicyExponential(retryCount));
    }).rejects.toThrow(expectedError);

    expect(networkClient.execute).toBeCalledTimes(retryCount + 1);
    expect(ApiInteractorImpl.getErrorResponse).toBeCalledTimes(1);
  });

  test('retryable error response without retry config', async () => {
    // given
    testResponseCode = 555;
    networkClient.execute = jest.fn(async () => ({...rawSuccessResponse, code: testResponseCode}));

    // when and then
    const response = await apiInteractor.execute(request);

    expect(response).toStrictEqual(errorResponse);
    expect(networkClient.execute).toBeCalledTimes(1);
    expect(ApiInteractorImpl.getErrorResponse).toBeCalledTimes(1);
  });

  test('error response with limited retries', async () => {
    const retryCount = 2;
    testResponseCode = 555;
    networkClient.execute = jest.fn(async () => ({...rawSuccessResponse, code: testResponseCode}));
    apiInteractor.prepareRetryConfig = jest.fn((retryPolicy, attemptIndex) => ({
      attemptIndex: attemptIndex + 1,
      delay: 1,
      shouldRetry: attemptIndex < retryCount,
    }));

    // when and then
    const response = await apiInteractor.execute(request, new RetryPolicyExponential(retryCount));

    expect(response).toStrictEqual(errorResponse);
    expect(networkClient.execute).toBeCalledTimes(retryCount + 1);
    expect(ApiInteractorImpl.getErrorResponse).toBeCalledTimes(1);
  });

  test('error response which shouldn\'t be retried', async () => {
    // given
    rawSuccessResponse = {
      code: 400, payload: undefined
    };
    const configHolderSpy = jest.spyOn(networkConfigHolder, 'setCanSendRequests');

    // when
    const result = await apiInteractor.execute(request);

    // then
    expect(result).toStrictEqual(errorResponse);
    expect(networkClient.execute).toBeCalledTimes(1);
    expect(ApiInteractorImpl.getErrorResponse).toBeCalledTimes(1);
    expect(apiInteractor.prepareRetryConfig).not.toBeCalled();
    expect(configHolderSpy).not.toBeCalled();
  });

  test('error response with code, blocking further executions', async () => {
    // given
    rawSuccessResponse = {
      code: 402, payload: undefined
    };
    const configHolderSpy = jest.spyOn(networkConfigHolder, 'setCanSendRequests');

    // when
    const result = await apiInteractor.execute(request);

    // then
    expect(result).toStrictEqual(errorResponse);
    expect(networkClient.execute).toBeCalledTimes(1);
    expect(ApiInteractorImpl.getErrorResponse).toBeCalledTimes(1);
    expect(configHolderSpy).toBeCalledWith(false);
    expect(apiInteractor.prepareRetryConfig).not.toBeCalled();
  });
});

describe('prepareRetryConfig tests', () => {
  beforeEach(() => {
    delayCalculator.countDelay = jest.fn((minDelay: number, retriesCount: number) => minDelay + retriesCount);
  });

  test('no retry after first attempt for retry policy none', () => {
    // given
    const retryPolicy: RetryPolicyNone = {};

    // when
    const retryConfig = apiInteractor.prepareRetryConfig(retryPolicy, 0);

    // then
    expect(retryConfig.shouldRetry).toBeFalsy();
    expect(delayCalculator.countDelay).not.toBeCalled();
  });

  test('no retry after several attempts for retry policy none', () => {
    // given
    const retryPolicy: RetryPolicyNone = {};

    // when
    const retryConfig = apiInteractor.prepareRetryConfig(retryPolicy, 10);

    // then
    expect(retryConfig.shouldRetry).toBeFalsy();
    expect(delayCalculator.countDelay).not.toBeCalled();
  });

  test('retry after first attempt for infinite exponential retry policy', () => {
    // given
    const retryPolicy = new RetryPolicyInfiniteExponential();

    // when
    const retryConfig = apiInteractor.prepareRetryConfig(retryPolicy, 0);

    // then
    expect(retryConfig.shouldRetry).toBeTruthy();
    expect(retryConfig.attemptIndex).toBe(1);
    expect(delayCalculator.countDelay).toBeCalledTimes(1);
  });

  test('retry after several attempts for infinite exponential retry policy', () => {
    // given
    const retryPolicy = new RetryPolicyInfiniteExponential();
    const attemptIndex = 5;

    // when
    const retryConfig = apiInteractor.prepareRetryConfig(retryPolicy, attemptIndex);

    // then
    expect(retryConfig.shouldRetry).toBeTruthy();
    expect(retryConfig.attemptIndex).toBe(attemptIndex + 1);
    expect(delayCalculator.countDelay).toBeCalledTimes(1);
  });

  test('no retry for infinite exponential retry policy with negative min delay', () => {
    // given
    const retryPolicy = new RetryPolicyInfiniteExponential(-10000);

    // when
    const retryConfig = apiInteractor.prepareRetryConfig(retryPolicy, 0);

    // then
    expect(retryConfig.shouldRetry).toBeFalsy();
    expect(delayCalculator.countDelay).not.toBeCalled();
  });

  test('retry after first attempt for exponential retry policy', () => {
    // given
    const retryPolicy = new RetryPolicyExponential();

    // when
    const retryConfig = apiInteractor.prepareRetryConfig(retryPolicy, 0);

    // then
    expect(retryConfig.shouldRetry).toBeTruthy();
    expect(retryConfig.attemptIndex).toBe(1);
    expect(delayCalculator.countDelay).toBeCalledTimes(1);
  });

  test('penultimate retry for exponential retry policy', () => {
    // given
    const attemptIndex = 5;
    const retryPolicy = new RetryPolicyExponential(attemptIndex + 1);

    // when
    const retryConfig = apiInteractor.prepareRetryConfig(retryPolicy, attemptIndex);

    // then
    expect(retryConfig.shouldRetry).toBeTruthy();
    expect(retryConfig.attemptIndex).toBe(attemptIndex + 1);
    expect(delayCalculator.countDelay).toBeCalledTimes(1);
  });

  test('last retry for exponential retry policy', () => {
    // given
    const attemptIndex = 5;
    const retryPolicy = new RetryPolicyExponential(attemptIndex);

    // when
    const retryConfig = apiInteractor.prepareRetryConfig(retryPolicy, attemptIndex);

    // then
    expect(retryConfig.shouldRetry).toBeFalsy();
    expect(delayCalculator.countDelay).not.toBeCalled();
  });

  test('no retry for exponential retry policy with negative min delay', () => {
    // given
    const retryPolicy = new RetryPolicyExponential(3, -10000);

    // when
    const retryConfig = apiInteractor.prepareRetryConfig(retryPolicy, 0);

    // then
    expect(retryConfig.shouldRetry).toBeFalsy();
    expect(delayCalculator.countDelay).not.toBeCalled();
  });
});

describe('getErrorResponse tests', () => {

  test('get error from correct api response', () => {
    // given
    const testErrorMessage = 'test error';
    const testErrorType = 'test error type';
    const testErrorCode = 400;
    const testErrorApiCode = 'test api code';
    const apiError: ApiError = {
      code: testErrorApiCode,
      message: testErrorMessage,
      type: testErrorType,
    };
    const networkResponse: RawNetworkResponse = {
      code: testErrorCode,
      payload: {error: apiError},
    };
    const expResult: NetworkResponseError = {
      apiCode: testErrorApiCode,
      code: testErrorCode,
      message: testErrorMessage,
      type: testErrorType,
      isSuccess: false,
    };

    // when
    const result = ApiInteractorImpl.getErrorResponse(networkResponse)

    // then
    expect(result).toStrictEqual(expResult);
  });

  test('get error from execution error', () => {
    // given
    const executionError = new Error('execution error');

    // when and then
    expect(() => {
      ApiInteractorImpl.getErrorResponse(undefined, executionError);
    }).toThrow(executionError);
  });

  test('get error from execution error', () => {
    // given

    // when and then
    expect(() => {
      ApiInteractorImpl.getErrorResponse();
    }).toThrow();
  });
});
