import {MS_IN_SEC} from '../utils/dateUtils';

export type RetryDelayCalculator = {
  countDelay: (minDelay: number, retriesCount: number) => number;
};

const JITTER = 0.4
const FACTOR = 2.4
const MAX_DELAY_MS = 1000000

export class ExponentialDelayCalculator implements RetryDelayCalculator {
  private readonly jitter = JITTER;
  private readonly factor = FACTOR;
  private readonly maxDelayMS = MAX_DELAY_MS;

  countDelay(minDelay: number, retriesCount: number): number {
    let delay = Math.floor(minDelay + Math.pow(this.factor, retriesCount) * MS_IN_SEC)
    const delta = Math.round(delay * this.jitter);

    delay += Math.floor(Math.random() * (delta + 1));

    return Math.min(delay, this.maxDelayMS);
  }
}
