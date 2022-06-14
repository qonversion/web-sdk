export const DEFAULT_RETRY_COUNT = 3;
export const DEFAULT_MIN_DELAY_MS = 500;
export const DEBUG_MODE_PREFIX = "test_";
export const PLATFORM_FOR_API = "web";
export const BASE_API_URL = "https://api.qonversion.io"
export const API_VERSION = "v2"
export const API_URL = BASE_API_URL + API_VERSION;

export const MIN_SUCCESS_CODE = 200;
export const MAX_SUCCESS_CODE = 299;
export const MIN_INTERNAL_SERVER_ERROR_CODE = 500;
export const MAX_INTERNAL_SERVER_ERROR_CODE = 599;

export const ERROR_CODES_BLOCKING_FURTHER_EXECUTIONS = [
  401, // UNAUTHORIZED,
  402, // PAYMENT_REQUIRED,
  418, // I'M A TEAPOT - for possible api usage.
];