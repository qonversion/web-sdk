import {expectQonversionError} from './utils';
import Qonversion, {QonversionConfig, QonversionErrorCode} from '../src';
import {QonversionInternal} from '../src/internal/QonversionInternal';

jest.mock('../src/internal/QonversionInternal');

test('get non-initialized backing instance', () => {
  // given

  // when and then
  expectQonversionError(QonversionErrorCode.NotInitialized, Qonversion.getSharedInstance)
});

test('initialize and get shared instance', () => {
  // given
  const mockQonversionConfig: QonversionConfig = {
    loggerConfig: undefined,
    networkConfig: undefined,
    primaryConfig: undefined,
  };

  // when
  Qonversion.initialize(mockQonversionConfig)

  // then
  expect(QonversionInternal).toBeCalled();
  expect(Qonversion['backingInstance']).not.toBeUndefined();
});
