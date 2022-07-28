import {DEFAULT_MIN_DELAY_MS, DEFAULT_RETRY_COUNT} from './constants';

// eslint-disable-next-line @typescript-eslint/ban-types
export type RetryPolicy = {};

export class RetryPolicyNone implements RetryPolicy {}

export class RetryPolicyExponential implements RetryPolicy {
  readonly retryCount: number;
  readonly minDelay: number;

  constructor(retryCount: number = DEFAULT_RETRY_COUNT, minDelay: number = DEFAULT_MIN_DELAY_MS) {
    this.retryCount = retryCount;
    this.minDelay = minDelay;
  }
}

export class RetryPolicyInfiniteExponential implements RetryPolicy {
  readonly minDelay: number;

  constructor(minDelay: number = DEFAULT_MIN_DELAY_MS) {
    this.minDelay = minDelay;
  }
}
