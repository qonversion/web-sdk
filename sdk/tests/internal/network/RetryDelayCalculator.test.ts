import {ExponentialDelayCalculator} from '../../../src/internal/network';

describe('ExponentialDelayCalculator tests', () => {
  const delayCalculator = new ExponentialDelayCalculator();

  test('common cases', () => {
    // given
    const cases = [[0, 0], [1000, 0]];

    cases.forEach(testCase => {
      const minDelay = testCase[0];
      const retriesCount = testCase[1];

      // when
      const res = delayCalculator.countDelay(minDelay, retriesCount);

      // then
      expect(res).toBeGreaterThan(minDelay);
    });
  });

  test('every next attempt is delayed more then previous ones', () => {
    // given
    const minDelay = 1;

    // when
    const delay1 = delayCalculator.countDelay(minDelay, 0)
    const delay2 = delayCalculator.countDelay(minDelay, 1)
    const delay3 = delayCalculator.countDelay(minDelay, 2)

    // then
    expect(delay1).toBeGreaterThanOrEqual(minDelay);
    expect(delay2).toBeGreaterThanOrEqual(delay1);
    expect(delay3).toBeGreaterThanOrEqual(delay2);
    expect(delay3 - delay2).toBeGreaterThanOrEqual(delay2 - delay1);
  });

  test('huge attempt index', () => {
    // given

    // when
    const delay = delayCalculator.countDelay(0, 10000000000);

    // then
    expect(delay).toBe(1000000); // MAX_DELAY_MS
  });
});
