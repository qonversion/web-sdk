import {
  MAX_INTERNAL_SERVER_ERROR_CODE,
  MAX_SUCCESS_CODE,
  MIN_INTERNAL_SERVER_ERROR_CODE,
  MIN_SUCCESS_CODE
} from './constants';

type ResponseCodeChecker = (code: number) => boolean;
export const isSuccessfulResponse: ResponseCodeChecker = code => {
  return MIN_SUCCESS_CODE <= code && code <= MAX_SUCCESS_CODE;
};

export const isInternalServerErrorResponse: ResponseCodeChecker = code => {
  return MIN_INTERNAL_SERVER_ERROR_CODE <= code && code <= MAX_INTERNAL_SERVER_ERROR_CODE;
};

type Delayer = (timeMs: number) => Promise<void>;
export const delay: Delayer = timeMs => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, timeMs);
  });
};
