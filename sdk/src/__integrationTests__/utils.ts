import {QonversionErrorCode} from '../exception/QonversionErrorCode';
import {QonversionError} from '../exception/QonversionError';

export const getCurrentTs = (): number => Math.floor(Date.now() / 1000);

export const expectQonversionErrorAsync = async (code: QonversionErrorCode, message: string, method: () => Promise<unknown>) => {
  try {
    await method();
    fail("Exception expected but was not thrown");
  } catch (e) {
    expect(e).toBeInstanceOf(QonversionError);
    expect((e as QonversionError).code).toBe(code);
    expect((e as QonversionError).message).toBe(message);
  }
}

const fail = (reason = "Fail was called in a test") => {
  throw new Error(reason);
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.fail = fail;
