import {QonversionErrorCode} from './QonversionErrorCode';

/**
 * Qonversion error that the SDK may throw on some calls.
 *
 * Check error code and details to get more information about concrete error you handle.
 */
export class QonversionError extends Error {
  readonly code: QonversionErrorCode;

  constructor(code: QonversionErrorCode, details?: string, cause?: Error) {
    super(details, {cause});
    this.code = code;
  }
}
