import {UserPropertiesStorageImpl} from '../../../internal/userProperties';
import {LocalStorage, LocalStorageImpl} from '../../../internal/common';

describe('UserPropertiesStorage tests', () => {
  let userPropertiesStorage: UserPropertiesStorageImpl;
  const mockLocalStorage: LocalStorage = new LocalStorageImpl();
  const testStorageKey = 'storage key';
  const initialProperties = {a: 'a'};
  let savePropertiesSpy;

  beforeEach(() => {
    // @ts-ignore
    mockLocalStorage.getObject = jest.fn(() => initialProperties);
    mockLocalStorage.putObject = jest.fn();
    userPropertiesStorage = new UserPropertiesStorageImpl(mockLocalStorage, testStorageKey);
    // @ts-ignore
    savePropertiesSpy = jest.spyOn(userPropertiesStorage, 'saveProperties');
  });

  test('constructor', () => {
    // given

    // when
    // done in beforeEach

    // then
    expect(userPropertiesStorage['properties']).toStrictEqual(initialProperties);
    expect(mockLocalStorage.getObject).toBeCalledWith(testStorageKey);
  });

  test('get properties', () => {
    // given
    const testProperties = {a: 'a', b: 'b'};
    userPropertiesStorage['properties'] = testProperties;

    // when
    const res = userPropertiesStorage.getProperties();

    // then
    expect(res).toStrictEqual(testProperties);
  });

  test('save properties', () => {
    // given

    // when
    userPropertiesStorage['saveProperties']();

    // then
    expect(mockLocalStorage.putObject).toBeCalledWith(testStorageKey, initialProperties);
  });

  test('add one', () => {
    // given
    const key = 'test key';
    const value = 'test value';
    const expProperties = {
      ...initialProperties,
      [key]: value
    };

    // when
    userPropertiesStorage.addOne(key, value);

    // then
    expect(userPropertiesStorage['properties']).toStrictEqual(expProperties);
    expect(savePropertiesSpy).toBeCalled();
  });

  test('add several', () => {
    // given
    const newProperties = {
      b: 'b',
      c: 'c',
    };
    const expProperties = {
      ...initialProperties,
      ...newProperties,
    };

    // when
    userPropertiesStorage.add(newProperties);

    // then
    expect(userPropertiesStorage['properties']).toStrictEqual(expProperties);
    expect(savePropertiesSpy).toBeCalled();
  });

  test('delete one', () => {
    // given
    userPropertiesStorage['properties'] = {
      b: 'bb',
      c: 'cc',
    };
    const expProperties = {
      c: 'cc',
    };

    // when
    userPropertiesStorage.deleteOne('b', 'bb');

    // then
    expect(userPropertiesStorage['properties']).toStrictEqual(expProperties);
    expect(savePropertiesSpy).toBeCalled();
  });

  test('delete one with changed value', () => {
    // given
    userPropertiesStorage['properties'] = {
      b: 'bb',
      c: 'cc',
    };
    const expProperties = {
      b: 'bb',
      c: 'cc',
    };

    // when
    userPropertiesStorage.deleteOne('b', 'cc');

    // then
    expect(userPropertiesStorage['properties']).toStrictEqual(expProperties);
    expect(savePropertiesSpy).not.toBeCalled();
  });

  test('delete several', () => {
    // given
    const deletingProperties = {
      a: 'aa',
      b: 'bb',
    };
    const expProperties = {
      c: 'cc',
    };
    userPropertiesStorage['properties'] = {
      ...deletingProperties,
      ...expProperties,
    };

    // when
    userPropertiesStorage.delete(deletingProperties);

    // then
    expect(userPropertiesStorage['properties']).toStrictEqual(expProperties);
    expect(savePropertiesSpy).toBeCalled();
  });

  test('delete several with some changed values', () => {
    // given
    const deletingProperties = {
      a: 'aa',
      b: 'cc',
    };
    const expProperties = {
      b: 'bb',
      c: 'cc',
    };
    userPropertiesStorage['properties'] = {
      a: 'aa',
      b: 'bb',
      c: 'cc',
    };

    // when
    userPropertiesStorage.delete(deletingProperties);

    // then
    expect(userPropertiesStorage['properties']).toStrictEqual(expProperties);
    expect(savePropertiesSpy).toBeCalled();
  });

  test('delete empty records', () => {
    // given
    const deletingProperties = {};
    const expProperties = {
      a: 'aa',
      b: 'bb',
      c: 'cc',
    };
    userPropertiesStorage['properties'] = {
      a: 'aa',
      b: 'bb',
      c: 'cc',
    };

    // when
    userPropertiesStorage.delete(deletingProperties);

    // then
    expect(userPropertiesStorage['properties']).toStrictEqual(expProperties);
    expect(savePropertiesSpy).toBeCalled();
  });

  test('clear', () => {
    // given
    userPropertiesStorage['properties'] = {
      a: 'aa',
      b: 'bb',
      c: 'cc',
    };

    // when
    userPropertiesStorage.clear();

    // then
    expect(userPropertiesStorage['properties']).toStrictEqual({});
    expect(savePropertiesSpy).toBeCalled();
  });
});
