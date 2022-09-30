import {QonversionError, QonversionErrorCode} from '../index';

export function expectQonversionError(code: QonversionErrorCode, method: () => unknown) {
  try {
    method();
    fail("Exception expected but was not thrown");
  } catch (e) {
    expect(e).toBeInstanceOf(QonversionError);
    // @ts-ignore
    expect(e.code).toBe(code);
  }
}

test('skip', () => {});
