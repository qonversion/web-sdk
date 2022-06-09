import {
  ApiError,
  IApiInteractor,
  INetworkClient,
  NetworkRequest,
  NetworkResponseError,
  NetworkResponseSuccess,
  NetworkRetryConfig,
  RawNetworkResponse
} from './types';
import {RetryDelayCalculator} from './RetryDelayCalculator';
import {NetworkConfigHolder} from '../types';
import {RetryPolicy, RetryPolicyExponential, RetryPolicyInfiniteExponential} from './RetryPolicy';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';
import {delay, isInternalServerErrorResponse, isSuccessfulResponse} from './utils';
import {ERROR_CODES_BLOCKING_FURTHER_EXECUTIONS} from './constants';

export class ApiInteractor implements IApiInteractor {
  private readonly networkClient: INetworkClient;
  private readonly delayCalculator: RetryDelayCalculator;
  private readonly configHolder: NetworkConfigHolder;
  private readonly defaultRetryPolicy: RetryPolicy;

  constructor(
    networkClient: INetworkClient,
    delayCalculator: RetryDelayCalculator,
    configHolder: NetworkConfigHolder,
    defaultRetryPolicy: RetryPolicy = new RetryPolicyExponential(),
  ) {
    this.networkClient = networkClient;
    this.delayCalculator = delayCalculator;
    this.configHolder = configHolder;
    this.defaultRetryPolicy = defaultRetryPolicy;
  }

  async execute<T>(
    request: NetworkRequest,
    retryPolicy: RetryPolicy = this.defaultRetryPolicy,
    attemptIndex: number = 0,
  ): Promise<NetworkResponseSuccess<T> | NetworkResponseError> {
    if (!this.configHolder.canSendRequests()) {
      throw new QonversionError(QonversionErrorCode.RequestDenied);
    }

    let executionError: QonversionError | undefined = undefined;
    let response: RawNetworkResponse | undefined = undefined;

    try {
      response = await this.networkClient.execute(request);
    } catch (cause) {
      if (cause instanceof QonversionError) {
        executionError = cause;
      } else {
        throw cause;
      }
    }

    if (response && isSuccessfulResponse(response.code)) {
      return {
        code: response.code,
        data: response.payload,
        isSuccess: true,
      };
    }

    if (response && ERROR_CODES_BLOCKING_FURTHER_EXECUTIONS.includes(response.code)) {
      this.configHolder.setCanSendRequests(false);
      return ApiInteractor.getErrorResponse(response, executionError);
    }

    const shouldTryToRetry = (!!response && isInternalServerErrorResponse(response.code)) || !!executionError;
    if (shouldTryToRetry) {
       const retryConfig = this.prepareRetryConfig(retryPolicy, attemptIndex);
       if (retryConfig.shouldRetry) {
         await delay(retryConfig.delay);
         return await this.execute(request, retryPolicy, retryConfig.attemptIndex)
       }
    }

    return ApiInteractor.getErrorResponse(response, executionError);
  }

  static getErrorResponse(response?: RawNetworkResponse, executionError?: Error): NetworkResponseError {
    if (response) {
      const apiError: ApiError = response.payload;
      return {
        code: response.code,
        message: apiError.message,
        type: apiError.type,
        apiCode: apiError.code,
        isSuccess: false,
      };
    } else if (executionError) {
      throw executionError;
    } else {
      // Unacceptable state.
      throw new Error('Unreachable code. Either response or executionError should be defined');
    }
  }

  prepareRetryConfig(retryPolicy: RetryPolicy, attemptIndex: number): NetworkRetryConfig {
    let shouldRetry = false;
    const newAttemptIndex = attemptIndex + 1;
    let minDelay = 0;
    let delay = 0;

    if (retryPolicy instanceof RetryPolicyInfiniteExponential) {
      shouldRetry = true;
      minDelay = retryPolicy.minDelay;
    } else if (retryPolicy instanceof RetryPolicyExponential) {
      shouldRetry = retryPolicy.retryCount > attemptIndex;
      minDelay = retryPolicy.minDelay;
    }

    if (minDelay < 0) {
      shouldRetry = false;
    }

    if (shouldRetry) {
      delay = this.delayCalculator.countDelay(minDelay, newAttemptIndex);
    }

    return {
      shouldRetry,
      attemptIndex: newAttemptIndex,
      delay,
    };
  }
}
