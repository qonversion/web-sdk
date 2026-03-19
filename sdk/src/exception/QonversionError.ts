import {QonversionErrorCode} from './QonversionErrorCode';

/**
 * Qonversion error that the SDK may throw on some calls.
 *
 * Check error code and details to get more information about concrete error you handle.
 */
export class QonversionError extends Error {
  readonly code: QonversionErrorCode;
  readonly details?: string;
  readonly cause?: Error;
  readonly responseCode?: number;

  constructor(code: QonversionErrorCode, details?: string, cause?: Error, responseCode?: number) {
    let message: string = code;
    if (details) {
      message += '. ' + details;
    }
    if (cause) {
      message += '. ' + cause.message;
    }

    super(message);

    this.code = code;
    this.details = details;
    this.cause = cause;
    this.responseCode = responseCode;
  }
}
