import {LocalStorage, LocalStorageImpl} from '../../../src/internal/common';

let savedJSON;

beforeAll(() => {
  savedJSON = JSON;
});

afterAll(() => {
  JSON = savedJSON;
});

describe('local storage tests', () => {
  let myLocalStorage: LocalStorage;
  const testKey = 'test key';
  const testValue = 'test value';

  beforeEach(() => {
    // @ts-ignore
    // noinspection JSConstantReassignment
    global.localStorage = {
      getItem: jest.fn(() => testValue),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    JSON.parse = jest.fn();
    JSON.stringify = jest.fn();

    myLocalStorage = new LocalStorageImpl();
  });

  test('put string', () => {
    // given
    const testValue = 'test value';

    // when
    myLocalStorage.putString(testKey, testValue);

    // then
    expect(localStorage.setItem).toBeCalledWith(testKey, testValue);
  });

  test('put number', () => {
    // given
    const testValue = 5;
    const strValue = '5';

      // when
    myLocalStorage.putNumber(testKey, testValue);

    // then
    expect(localStorage.setItem).toBeCalledWith(testKey, strValue);
  });

  test('put object', () => {
    // given
    const testValue = {a: 'a', b: 'b'};
    const strValue = 'object as string'
    JSON.stringify = jest.fn(() => strValue);

    // when
    myLocalStorage.putObject(testKey, testValue);

    // then
    expect(JSON.stringify).toBeCalledWith(testValue);
    expect(localStorage.setItem).toBeCalledWith(testKey, strValue);
  });

  test('put object faces error', () => {
    // given
    const testValue = {a: 'a', b: 'b'};
    JSON.stringify = jest.fn(() => {throw new Error()});

    // when
    myLocalStorage.putObject(testKey, testValue);

    // then
    expect(JSON.stringify).toBeCalledWith(testValue);
    expect(localStorage.setItem).not.toBeCalled();
  });

  test('get string', () => {
    // given

    // when
    const res = myLocalStorage.getString(testKey);

    // then
    expect(res).toBe(testValue);
    expect(localStorage.getItem).toBeCalledWith(testKey);
  });

  test('get int', () => {
    // given
    const expRes = 10;
    localStorage.getItem = jest.fn(() => expRes.toString());

    // when
    const res = myLocalStorage.getInt(testKey);

    // then
    expect(res).toBe(expRes);
    expect(localStorage.getItem).toBeCalledWith(testKey);
  });

  test('get int from incorrect string', () => {
    // given

    // when
    const res = myLocalStorage.getInt(testKey);

    // then
    expect(res).toBe(NaN);
    expect(localStorage.getItem).toBeCalledWith(testKey);
  });

  test('get int from undefined string', () => {
    // given
    localStorage.getItem = jest.fn(() => undefined);

    // when
    const res = myLocalStorage.getInt(testKey);

    // then
    expect(res).toBeUndefined();
    expect(localStorage.getItem).toBeCalledWith(testKey);
  });

  test('get float', () => {
    // given
    const expRes = 10.52;
    localStorage.getItem = jest.fn(() => expRes.toString());

    // when
    const res = myLocalStorage.getFloat(testKey);

    // then
    expect(res).toBe(expRes);
    expect(localStorage.getItem).toBeCalledWith(testKey);
  });

  test('get float from incorrect string', () => {
    // given

    // when
    const res = myLocalStorage.getFloat(testKey);

    // then
    expect(res).toBe(NaN);
    expect(localStorage.getItem).toBeCalledWith(testKey);
  });

  test('get float from undefined string', () => {
    // given
    localStorage.getItem = jest.fn(() => undefined);

    // when
    const res = myLocalStorage.getFloat(testKey);

    // then
    expect(res).toBeUndefined();
    expect(localStorage.getItem).toBeCalledWith(testKey);
  });

  test('get object', () => {
    // given
    const expRes = {a: 'a', b: 'b'};
    JSON.parse = jest.fn(() => expRes);

    // when
    const res = myLocalStorage.getObject(testKey);

    // then
    expect(res).toBe(expRes);
    expect(localStorage.getItem).toBeCalledWith(testKey);
    expect(JSON.parse).toBeCalledWith(testValue);
  });

  test('get object from incorrect string', () => {
    // given
    JSON.parse = jest.fn(() => {throw new Error()});

    // when
    const res = myLocalStorage.getObject(testKey);

    // then
    expect(res).toBeUndefined();
    expect(localStorage.getItem).toBeCalledWith(testKey);
    expect(JSON.parse).toBeCalledWith(testValue);
  });

  test('get object from undefined string', () => {
    // given
    localStorage.getItem = jest.fn(() => undefined);

    // when
    const res = myLocalStorage.getObject(testKey);

    // then
    expect(res).toBeUndefined();
    expect(localStorage.getItem).toBeCalledWith(testKey);
    expect(JSON.parse).not.toBeCalled();
  });

  test('remove value', () => {
    // given

    // when
    myLocalStorage.remove(testKey);

    // then
    expect(localStorage.removeItem).toBeCalledWith(testKey);
  });
});