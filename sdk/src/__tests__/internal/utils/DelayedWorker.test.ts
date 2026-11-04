import {DelayedWorker, DelayedWorkerImpl} from '../../../internal/utils/DelayedWorker';

describe('DelayedWorker tests', () => {
  let delayedWorker: DelayedWorker;
  let testAction: () => Promise<void>;
  const testDelay = 1000;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    jest.spyOn(global, 'clearTimeout');

    testAction = jest.fn(async () => {});
    delayedWorker = new DelayedWorkerImpl();
  });

  test('do normal delayed job', async () => {
    // given
    delayedWorker.isInProgress = jest.fn(() => false);

    // when
    delayedWorker.doDelayed(testDelay, testAction);

    // then
    expect(delayedWorker.isInProgress).toHaveBeenCalled();
    // @ts-ignore
    expect(delayedWorker['timeoutId']).not.toBeUndefined();
    expect(testAction).not.toHaveBeenCalled();

    jest.advanceTimersByTime(testDelay / 2);
    expect(testAction).not.toHaveBeenCalled();

    jest.advanceTimersByTime(testDelay / 2 + 1);
    await expect(testAction).toHaveBeenCalled();
    // @ts-ignore
    expect(delayedWorker['timeoutId']).toBeUndefined();
  });

  test('do delayed job when another one is in progress', () => {
    // given
    delayedWorker.isInProgress = jest.fn(() => true);

    // when
    delayedWorker.doDelayed(testDelay, testAction);

    // then
    expect(delayedWorker.isInProgress).toHaveBeenCalled();
    expect(testAction).not.toHaveBeenCalled();

    jest.runAllTimers();

    expect(testAction).not.toHaveBeenCalled();
  });

  test('do delayed job ignoring existing one', () => {
    // given
    // @ts-ignore
    delayedWorker['timeoutId'] = 500;
    const cancelSpy = jest.spyOn(delayedWorker, 'cancel');

    // when
    delayedWorker.doDelayed(testDelay, testAction, true);

    // then
    expect(cancelSpy).toHaveBeenCalled();
    // @ts-ignore
    expect(delayedWorker['timeoutId']).not.toBeUndefined();
    expect(testAction).not.toHaveBeenCalled();

    jest.runAllTimers();
    expect(testAction).toHaveBeenCalled();
  });

  test('do immediately', () => {
    // given
    delayedWorker.cancel = jest.fn();

    // when
    delayedWorker.doImmediately(testAction);

    // then
    expect(delayedWorker.cancel).toHaveBeenCalled();
    expect(setTimeout).not.toHaveBeenCalled();
    expect(testAction).toHaveBeenCalled();
  });

  test('cancelling started timeout', () => {
    // given
    const timeoutId = 500;
    // @ts-ignore
    delayedWorker['timeoutId'] = timeoutId;

    // when
    delayedWorker.cancel();

    // then
    expect(clearTimeout).toHaveBeenCalledWith(timeoutId);
    // @ts-ignore
    expect(delayedWorker['timeoutId']).toBeUndefined();
  });

  test('cancelling undefined timeout', () => {
    // given

    // when
    delayedWorker.cancel();

    // then
    expect(clearTimeout).not.toHaveBeenCalled();
    // @ts-ignore
    expect(delayedWorker['timeoutId']).toBeUndefined();
  });

  test('work is in progress', () => {
    // given
    // @ts-ignore
    delayedWorker['timeoutId'] = 500;

    // when
    const res = delayedWorker.isInProgress();

    // then
    expect(res).toBeTruthy();
  });

  test('no work in progress', () => {
    // given

    // when
    const res = delayedWorker.isInProgress();

    // then
    expect(res).toBeFalsy();
  });
});
