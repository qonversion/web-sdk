import {
  ApiError,
  ApiInteractor,
  NetworkClient,
  NetworkRequest,
  ApiResponseError,
  ApiResponseSuccess,
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

export class ApiInteractorImpl implements ApiInteractor {
  private readonly networkClient: NetworkClient;
  private readonly delayCalculator: RetryDelayCalculator;
  private readonly configHolder: NetworkConfigHolder;
  private readonly defaultRetryPolicy: RetryPolicy;

  constructor(
    networkClient: NetworkClient,
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
  ): Promise<ApiResponseSuccess<T> | ApiResponseError> {
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
      return ApiInteractorImpl.getErrorResponse(response, executionError);
    }

    const shouldTryToRetry =
      (!!response && isInternalServerErrorResponse(response.code)) ||
      (!!executionError && this.shouldRetryExecutionError(executionError));
    if (shouldTryToRetry) {
       const retryConfig = this.prepareRetryConfig(retryPolicy, attemptIndex);
       if (retryConfig.shouldRetry) {
         await delay(retryConfig.delay);
         return await this.execute(request, retryPolicy, retryConfig.attemptIndex)
       }
    }

    return ApiInteractorImpl.getErrorResponse(response, executionError);
  }

  static getErrorResponse(response?: RawNetworkResponse, executionError?: Error): ApiResponseError {
    if (response) {
      const apiError = ApiInteractorImpl.extractApiError(response);
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

  /**
   * Only a well-formed API error body is interpreted as an API error. The status code
   * of any other body is not trusted: a proxy or a CDN can answer 404 or 401 with its
   * own document, and reading that as "user not found" would make the SDK recreate
   * the user or re-link the identity. Such responses surface as a backend error that
   * carries the HTTP status. Optional fields are kept only when they have the declared type.
   */
  private static extractApiError(response: RawNetworkResponse): ApiError {
    if (!ApiInteractorImpl.isApiErrorPayload(response.payload)) {
      throw new QonversionError(
        QonversionErrorCode.BackendError,
        'Unexpected API error response',
        undefined,
        response.code,
      );
    }

    const {message, type, code} = response.payload.error;
    return {
      message,
      type: typeof type === 'string' ? type : undefined,
      code: typeof code === 'string' ? code : undefined,
    };
  }

  private static isApiErrorPayload(
    payload: unknown,
  ): payload is {error: {message: string; type?: unknown; code?: unknown}} {
    if (!payload || typeof payload !== 'object' || !('error' in payload)) {
      return false;
    }

    const error = (payload as {error: unknown}).error;
    return !!error && typeof error === 'object' && typeof (error as {message?: unknown}).message === 'string';
  }

  private shouldRetryExecutionError(error: QonversionError): boolean {
    if (error.responseCode !== undefined) {
      return isInternalServerErrorResponse(error.responseCode);
    }

    return true;
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
