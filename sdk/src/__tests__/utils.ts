import {QonversionError, QonversionErrorCode} from '../index';

export function expectQonversionError(code: QonversionErrorCode, method: () => unknown) {
  try {
    method();
    fail("Exception expected but was not thrown");
  } catch (e) {
    expect(e).toBeInstanceOf(QonversionError);
    expect((e as QonversionError).code).toBe(code);
  }
}

test('skip', () => {});
