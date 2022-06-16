import {QonversionError, QonversionErrorCode} from '../src';

export function expectQonversionError(code: QonversionErrorCode, method: () => unknown) {
  try {
    method();
    fail("Exception expected but was not thrown");
  } catch (e) {
    expect(e).toBeInstanceOf(QonversionError);
    expect(e.code).toBe(code);
  }
}
