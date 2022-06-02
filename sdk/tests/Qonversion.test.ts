import {expectQonversionError} from './utils';
import Qonversion, {QonversionConfig, QonversionErrorCode} from '../src';

test('get non-initialized backing instance', () => {
  // given

  // when and then
  expectQonversionError(QonversionErrorCode.NotInitialized, Qonversion.getSharedInstance)
});

test('initialize and get shared instance', () => {
  // given
  const mockQonversionConfig: QonversionConfig = {
    cacheLifetime: undefined,
    loggerConfig: undefined,
    networkConfig: undefined,
    primaryConfig: undefined,
  };

  // when
  Qonversion.initialize(mockQonversionConfig)

  // then
  expect(Qonversion['backingInstance']).not.toBe(undefined);
});
