import {expectQonversionError} from './utils';
import Qonversion, {QonversionConfig, QonversionErrorCode} from '../index';
import {QonversionInternal} from '../internal';

jest.mock('../internal/QonversionInternal');

test('get non-initialized backing instance', () => {
  // given

  // when and then
  expectQonversionError(QonversionErrorCode.NotInitialized, Qonversion.getSharedInstance)
});

test('initialize and get shared instance', () => {
  // given
  const mockQonversionConfig: QonversionConfig = {
    // @ts-ignore
    loggerConfig: undefined,
    // @ts-ignore
    networkConfig: undefined,
    // @ts-ignore
    primaryConfig: undefined,
  };

  // when
  Qonversion.initialize(mockQonversionConfig)

  // then
  expect(QonversionInternal).toBeCalled();
  expect(Qonversion['backingInstance']).not.toBeUndefined();
});
