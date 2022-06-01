/**
 * Qonversion exception that SDK may throw inside a throwable functions.
 *
 * Check error code and details to get more information about concrete exception you handle.
 */
import {QonversionErrorCode} from './QonversionErrorCode';

export class QonversionError extends Error {
  readonly code: QonversionErrorCode;
  readonly cause?: Error;

  constructor(code: QonversionErrorCode, details?: string, cause?: Error) {
    super(details);
    this.code = code;
    this.cause = cause;
  }
}
