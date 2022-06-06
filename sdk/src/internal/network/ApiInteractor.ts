import {
  IApiInteractor,
  INetworkClient,
  NetworkRequest,
  NetworkResponseError,
  NetworkResponseSuccess,
  RawNetworkResponse
} from './types';
import {RetryDelayCalculator} from './RetryDelayCalculator';
import {NetworkConfigHolder} from '../types';
import {RetryPolicy, RetryPolicyExponential} from './RetryPolicy';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

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

  async execute(
    request: NetworkRequest,
    retryPolicy: RetryPolicy = this.defaultRetryPolicy,
    attemptIndex: number = 0,
  ): Promise<NetworkResponseSuccess | NetworkResponseError> {
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

    return {
      code: response?.code ?? 200,
      message: "rf",
    };
  }
}
