import {expectQonversionError} from './utils';
import Qonversion, {QonversionErrorCode} from '../src';

test('get non-initialized backing instance', () => {
  // given

  // when and then
  expectQonversionError(QonversionErrorCode.NotInitialized, Qonversion.getSharedInstance)
});
