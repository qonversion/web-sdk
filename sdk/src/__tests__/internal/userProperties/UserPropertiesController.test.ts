import {
  UserPropertiesControllerImpl,
  UserPropertiesService,
  UserPropertiesStorage
} from '../../../internal/userProperties';
import {DelayedWorker} from '../../../internal/utils/DelayedWorker';
import {Logger} from '../../../internal/logger';
import {QonversionError, QonversionErrorCode, UserProperty} from '../../../index';
import {UserChangedNotifier} from '../../../internal/user';

let userPropertiesController: UserPropertiesControllerImpl;
let pendingUserPropertiesStorage: UserPropertiesStorage;
let sentUserPropertiesStorage: UserPropertiesStorage;
let userPropertiesService: UserPropertiesService;
let delayedWorker: DelayedWorker;
let logger: Logger;
let userChangedNotifier: UserChangedNotifier;
const testSendingDelayMs = 10000;

beforeEach(() => {
  // @ts-ignore
  pendingUserPropertiesStorage = {};
  // @ts-ignore
  sentUserPropertiesStorage = {};
  // @ts-ignore
  userPropertiesService = {};
  // @ts-ignore
  delayedWorker = {};
  // @ts-ignore
  logger = {
    verbose: jest.fn(),
  };
  userChangedNotifier = {
    subscribeOnUserChanges: jest.fn(),
  }

  userPropertiesController = new UserPropertiesControllerImpl(
    pendingUserPropertiesStorage,
    sentUserPropertiesStorage,
    userPropertiesService,
    delayedWorker,
    logger,
    userChangedNotifier,
    testSendingDelayMs
  );
});

describe('constructor tests', () => {
  test('subscribing on user changes', () => {
    // given

    // when

    // then
    expect(userChangedNotifier.subscribeOnUserChanges).toBeCalledWith(userPropertiesController);
  });
});

describe('set property/properties tests', () => {

  beforeEach(() => {
    userPropertiesController['sendUserPropertiesIfNeeded'] = jest.fn();
  });

  test('single property', () => {
    // given
    const key = "test_key";
    const value = "test value";
    userPropertiesController.setProperties = jest.fn();

    // when
    userPropertiesController.setProperty(key, value);

    // then
    expect(userPropertiesController.setProperties).toBeCalledWith({[key]: value});
  });

  test('multiple valid properties', () => {
    // given
    const properties = {
      a: 'aa',
      b: 'bb',
    };
    userPropertiesController['shouldSendProperty'] = jest.fn(() => true);
    pendingUserPropertiesStorage.add = jest.fn();

    // when
    userPropertiesController.setProperties(properties);

    // then
    expect(userPropertiesController['shouldSendProperty']).toBeCalledWith('a', 'aa');
    expect(userPropertiesController['shouldSendProperty']).toBeCalledWith('b', 'bb');
    expect(pendingUserPropertiesStorage.add).toBeCalledWith(properties);
    expect(userPropertiesController['sendUserPropertiesIfNeeded']).toBeCalledTimes(1);
    expect(logger.verbose).toBeCalledWith('Setting user properties', properties);
  });

  test('multiple invalid properties', () => {
    // given
    const properties = {
      a: 'aa',
      b: 'bb',
    };
    userPropertiesController['shouldSendProperty'] = jest.fn(() => false);
    pendingUserPropertiesStorage.add = jest.fn();

    // when
    userPropertiesController.setProperties(properties);

    // then
    expect(userPropertiesController['shouldSendProperty']).toBeCalledWith('a', 'aa');
    expect(userPropertiesController['shouldSendProperty']).toBeCalledWith('b', 'bb');
    expect(pendingUserPropertiesStorage.add).toBeCalledWith({});
    expect(userPropertiesController['sendUserPropertiesIfNeeded']).toBeCalledTimes(1);
    expect(logger.verbose).toBeCalledWith('Setting user properties', properties);
  });

  test('multiple properties with several valid', () => {
    // given
    const properties = {
      a: 'aa',
      b: 'bb',
    };
    userPropertiesController['shouldSendProperty'] = jest.fn((key) => key == 'a');
    pendingUserPropertiesStorage.add = jest.fn();

    // when
    userPropertiesController.setProperties(properties);

    // then
    expect(userPropertiesController['shouldSendProperty']).toBeCalledWith('a', 'aa');
    expect(userPropertiesController['shouldSendProperty']).toBeCalledWith('b', 'bb');
    expect(pendingUserPropertiesStorage.add).toBeCalledWith({a: 'aa'});
    expect(userPropertiesController['sendUserPropertiesIfNeeded']).toBeCalledTimes(1);
    expect(logger.verbose).toBeCalledWith('Setting user properties', properties);
  });
});

describe('sendUserPropertiesIfNeeded tests', () => {

  beforeEach(() => {
    userPropertiesController['sendUserProperties'] = jest.fn(async () => {});
    delayedWorker.doDelayed = jest.fn(async (delay, action) => await action());
  });

  test('non-empty properties', async () => {
    // given
    const properties = {a: 'aa'};
    pendingUserPropertiesStorage.getProperties = jest.fn(() => properties);

    // when
    userPropertiesController['sendUserPropertiesIfNeeded']();

    // then
    expect(pendingUserPropertiesStorage.getProperties).toBeCalled();
    expect(delayedWorker.doDelayed).toBeCalledWith(testSendingDelayMs, expect.any(Function), false);
    expect(userPropertiesController['sendUserProperties']).toBeCalled();
  });

  test('empty properties', async () => {
    // given
    const properties = {};
    pendingUserPropertiesStorage.getProperties = jest.fn(() => properties);

    // when
    userPropertiesController['sendUserPropertiesIfNeeded']();

    // then
    expect(pendingUserPropertiesStorage.getProperties).toBeCalled();
    expect(delayedWorker.doDelayed).not.toBeCalled();
    expect(userPropertiesController['sendUserProperties']).not.toBeCalled();
  });

  test('ignoring existing job', async () => {
    // given
    const properties = {a: 'aa'};
    pendingUserPropertiesStorage.getProperties = jest.fn(() => properties);

    // when
    userPropertiesController['sendUserPropertiesIfNeeded'](true);

    // then
    expect(pendingUserPropertiesStorage.getProperties).toBeCalled();
    expect(delayedWorker.doDelayed).toBeCalledWith(testSendingDelayMs, expect.any(Function), true);
    expect(userPropertiesController['sendUserProperties']).toBeCalled();
  });
});

describe('sendUserProperties tests', () => {
  beforeEach(() => {
    userPropertiesController['sendUserPropertiesIfNeeded'] = jest.fn();
    pendingUserPropertiesStorage.delete = jest.fn();
    sentUserPropertiesStorage.add = jest.fn();
    logger.warn = jest.fn();
    logger.error = jest.fn();
  });

  test('successfully send properties', async () => {
    // given
    const properties = {a: 'aa'};
    pendingUserPropertiesStorage.getProperties = jest.fn(() => properties);
    const processedPropertyKeys = Object.keys(properties);
    userPropertiesService.sendProperties = jest.fn(async () => processedPropertyKeys);

    // when
    await userPropertiesController['sendUserProperties']();

    // then
    expect(pendingUserPropertiesStorage.getProperties).toBeCalled();
    expect(userPropertiesService.sendProperties).toBeCalledWith(properties);
    expect(pendingUserPropertiesStorage.delete).toBeCalledWith(properties);
    expect(sentUserPropertiesStorage.add).toBeCalledWith(properties);
    expect(userPropertiesController['sendUserPropertiesIfNeeded']).toBeCalledWith(true);

    expect(logger.verbose).toBeCalledWith('Sending user properties', properties);
    expect(logger.verbose).toBeCalledWith('User properties were sent', {processedPropertyKeys});
    expect(logger.warn).not.toBeCalled();
    expect(logger.error).not.toBeCalled();
  });

  test('send empty properties', async () => {
    // given
    const properties = {};
    pendingUserPropertiesStorage.getProperties = jest.fn(() => properties);
    userPropertiesService.sendProperties = jest.fn(async () => []);

    // when
    await userPropertiesController['sendUserProperties']();

    // then
    expect(pendingUserPropertiesStorage.getProperties).toBeCalled();
    expect(userPropertiesService.sendProperties).not.toBeCalled();
    expect(pendingUserPropertiesStorage.delete).not.toBeCalled();
    expect(sentUserPropertiesStorage.add).not.toBeCalled();

    expect(logger.verbose).not.toBeCalled();
    expect(logger.warn).not.toBeCalled();
    expect(logger.error).not.toBeCalled();
  });

  test('Failed to send properties', async () => {
    // given
    const properties = {a: 'aa'};
    pendingUserPropertiesStorage.getProperties = jest.fn(() => properties);
    const expError = new QonversionError(QonversionErrorCode.BackendError);
    userPropertiesService.sendProperties = jest.fn(async () => {throw expError});

    // when
    await userPropertiesController['sendUserProperties']();

    // then
    expect(pendingUserPropertiesStorage.getProperties).toBeCalled();
    expect(userPropertiesService.sendProperties).toBeCalledWith(properties);
    expect(logger.error).toBeCalledWith('Failed to send user properties to api', expError);
    expect(pendingUserPropertiesStorage.delete).not.toBeCalled();
    expect(sentUserPropertiesStorage.add).not.toBeCalled();

    expect(logger.verbose).toBeCalledWith('Sending user properties', properties);
  });

  test('not all properties were processed', async () => {
    // given
    const properties = {a: 'aa', b: 'bb'};
    pendingUserPropertiesStorage.getProperties = jest.fn(() => properties);
    const processedProperties = {a: 'aa'};
    const processedPropertyKeys = Object.keys(processedProperties);
    userPropertiesService.sendProperties = jest.fn(async () => processedPropertyKeys);

    // when
    await userPropertiesController['sendUserProperties']();

    // then
    expect(pendingUserPropertiesStorage.getProperties).toBeCalled();
    expect(userPropertiesService.sendProperties).toBeCalledWith(properties);
    expect(pendingUserPropertiesStorage.delete).toBeCalledWith(properties);
    expect(sentUserPropertiesStorage.add).toBeCalledWith(processedProperties);
    expect(logger.warn).toBeCalledWith('Some user properties were not processed: b.');
    expect(userPropertiesController['sendUserPropertiesIfNeeded']).toBeCalledWith(true);

    expect(logger.verbose).toBeCalledWith('Sending user properties', properties);
    expect(logger.verbose).toBeCalledWith('User properties were sent', {processedPropertyKeys});
  });
});

describe('onUserChanged tests', () => {
  test('user changed handling', () => {
    // given
    pendingUserPropertiesStorage.clear = jest.fn();
    sentUserPropertiesStorage.clear = jest.fn();

    // when
    userPropertiesController.onUserChanged();

    // then
    expect(pendingUserPropertiesStorage.clear).toBeCalled();
    expect(sentUserPropertiesStorage.clear).toBeCalled();
  });
});

describe('Validator tests', () => {
  beforeEach(() => {
    logger.info = jest.fn();
    logger.error = jest.fn();
  });

  test('values', () => {
    // given
    const testCases: Record<string, boolean> = {
      test_value: true,
      ['']: false,
    };
    const keys = Object.keys(testCases);

    keys.forEach(testValue => {
      // when
      const res = UserPropertiesControllerImpl['isValidValue'](testValue);

      // then
      expect(res).toBe(testCases[testValue]);
    });
  });

  test('keys', () => {
    // given
    const testCases: Record<string, boolean> = {
      test_key: true,
      [UserProperty.AppsFlyerUserId]: true,
      ['']: false,
      ['   ']: false,
      ['test key']: false,
    };
    const keys = Object.keys(testCases);

    keys.forEach(testKey => {
      // when
      const res = UserPropertiesControllerImpl['isValidKey'](testKey);

      // then
      expect(res).toBe(testCases[testKey]);
    });
  });

  test('Valid user property', () => {
    // given
    const key = 'test_key';
    const value = 'test value';
    sentUserPropertiesStorage.getProperties = jest.fn(() => ({}));

    // when
    const res = userPropertiesController['shouldSendProperty'](key, value);

    // then
    expect(res).toBeTruthy();
    expect(logger.info).not.toBeCalled();
    expect(logger.error).not.toBeCalled();
  });

  test('Already sent user property', () => {
    // given
    const key = 'test_key';
    const value = 'test value';
    sentUserPropertiesStorage.getProperties = jest.fn(() => ({[key]: value}));
    const expInfoMessage = `The property with key: "${key}" and value: "${value}" ` +
      'has been sent already for the current user. SDK will not send it again to avoid any confusion.';

    // when
    const res = userPropertiesController['shouldSendProperty'](key, value);

    // then
    expect(res).toBeFalsy();
    expect(logger.info).toBeCalledWith(expInfoMessage);
    expect(logger.error).not.toBeCalled();
  });

  test('Already sent invalid user property', () => {
    // given
    const key = '   ';
    const value = 'test value';
    sentUserPropertiesStorage.getProperties = jest.fn(() => ({[key]: value}));
    const expErrorMessage = `Invalid key "${key}" for user property. ` +
      'The key should be nonempty and may consist of letters A-Za-z, numbers, and symbols _.:-.';

    // when
    const res = userPropertiesController['shouldSendProperty'](key, value);

    // then
    expect(res).toBeFalsy();
    expect(logger.error).toBeCalledWith(expErrorMessage);
    expect(logger.info).not.toBeCalled();
  });

  test('already sent property with the same key and another value', () => {
    // given
    const key = 'test_key';
    const value = 'test value';
    sentUserPropertiesStorage.getProperties = jest.fn(() => ({[key]: 'another value'}));

    // when
    const res = userPropertiesController['shouldSendProperty'](key, value);

    // then
    expect(res).toBeTruthy();
    expect(logger.info).not.toBeCalled();
    expect(logger.error).not.toBeCalled();
  });

  test('already sent property with the same value and another key', () => {
    // given
    const key = 'test_key';
    const value = 'test value';
    sentUserPropertiesStorage.getProperties = jest.fn(() => ({another_key: value}));

    // when
    const res = userPropertiesController['shouldSendProperty'](key, value);

    // then
    expect(res).toBeTruthy();
    expect(logger.info).not.toBeCalled();
    expect(logger.error).not.toBeCalled();
  });

  test('user property with invalid key', () => {
    // given
    const key = 'test key';
    const value = 'test value';
    const expErrorMessage = `Invalid key "${key}" for user property. ` +
      'The key should be nonempty and may consist of letters A-Za-z, numbers, and symbols _.:-.';

    // when
    const res = userPropertiesController['shouldSendProperty'](key, value);

    // then
    expect(res).toBeFalsy();
    expect(logger.info).not.toBeCalled();
    expect(logger.error).toBeCalledWith(expErrorMessage);
  });

  test('user property with invalid value', () => {
    // given
    const key = 'test_key';
    const value = '';
    const expErrorMessage = `The empty value provided for user property "${key}".`;

    // when
    const res = userPropertiesController['shouldSendProperty'](key, value);

    // then
    expect(res).toBeFalsy();
    expect(logger.info).not.toBeCalled();
    expect(logger.error).toBeCalledWith(expErrorMessage);
  });

  test('user property with invalid key and value', () => {
    // given
    const key = 'test key';
    const value = '';
    const expKeyErrorMessage = `Invalid key "${key}" for user property. ` +
      'The key should be nonempty and may consist of letters A-Za-z, numbers, and symbols _.:-.';
    const expValueErrorMessage = `The empty value provided for user property "${key}".`;

    // when
    const res = userPropertiesController['shouldSendProperty'](key, value);

    // then
    expect(res).toBeFalsy();
    expect(logger.info).not.toBeCalled();
    expect(logger.error).toBeCalledTimes(2);
    expect(logger.error).toBeCalledWith(expKeyErrorMessage);
    expect(logger.error).toBeCalledWith(expValueErrorMessage);
  });
});