import {DelayedWorker, DelayedWorkerImpl} from '../../../src/internal/utils/DelayedWorker';

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

  test('do normal delayed job', () => {
    // given
    delayedWorker.isInProgress = jest.fn(() => false);

    // when
    delayedWorker.doDelayed(testDelay, testAction);

    // then
    expect(delayedWorker.isInProgress).toBeCalled();
    expect(delayedWorker['timeoutId']).not.toBeUndefined();
    expect(testAction).not.toBeCalled();

    jest.advanceTimersByTime(testDelay / 2);
    expect(testAction).not.toBeCalled();

    jest.advanceTimersByTime(testDelay / 2 + 1);
    expect(testAction).toBeCalled();
  });

  test('do delayed job when another one is in progress', () => {
    // given
    delayedWorker.isInProgress = jest.fn(() => true);

    // when
    delayedWorker.doDelayed(testDelay, testAction);

    // then
    expect(delayedWorker.isInProgress).toBeCalled();
    expect(testAction).not.toBeCalled();

    jest.runAllTimers();

    expect(testAction).not.toBeCalled();
  });

  test('do delayed job ignoring existing one', () => {
    // given
    delayedWorker['timeoutId'] = 500;
    const cancelSpy = jest.spyOn(delayedWorker, 'cancel');

    // when
    delayedWorker.doDelayed(testDelay, testAction, true);

    // then
    expect(cancelSpy).toBeCalled();
    expect(delayedWorker['timeoutId']).not.toBeUndefined();
    expect(testAction).not.toBeCalled();

    jest.runAllTimers();
    expect(testAction).toBeCalled();
  });

  test('do immediately', () => {
    // given
    delayedWorker.cancel = jest.fn();

    // when
    delayedWorker.doImmediately(testAction);

    // then
    expect(delayedWorker.cancel).toBeCalled();
    expect(setTimeout).not.toBeCalled();
    expect(testAction).toBeCalled();
  });

  test('cancelling started timeout', () => {
    // given
    const timeoutId = 500;
    delayedWorker['timeoutId'] = timeoutId;

    // when
    delayedWorker.cancel();

    // then
    expect(clearTimeout).toBeCalledWith(timeoutId);
    expect(delayedWorker['timeoutId']).toBeUndefined();
  });

  test('cancelling undefined timeout', () => {
    // given

    // when
    delayedWorker.cancel();

    // then
    expect(clearTimeout).not.toBeCalled();
    expect(delayedWorker['timeoutId']).toBeUndefined();
  });

  test('work is in progress', () => {
    // given
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
