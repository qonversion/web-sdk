import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const AEGIS_URL = process.env.AEGIS_URL || '';
export const STRIPE_PRODUCT_ID = process.env.STRIPE_PRODUCT_ID || '';
export const STRIPE_SUBSCRIPTION_ID = process.env.STRIPE_SUBSCRIPTION_ID || '';
export const PROJECT_KEY_FOR_TESTS = 'PV77YHL7qnGvsdmpTs7gimsxUvY-Znl2';
export const PRIVATE_TOKEN_FOR_TESTS = 'sk_Yp-HzIBFO_mZE0YqNBeQLDrQoWmvJvSt';
export const TS_EPSILON = 100;

// No-Codes test constants
export const PROJECT_KEY_FOR_SCREENS = "V4pK6FQo3PiDPj_2vYO1qZpNBbFXNP-a";
export const INCORRECT_PROJECT_KEY_FOR_SCREENS = "V4pK6FQo3PiDPj_2vYO1qZpNBbFXNP-aaaaa";
export const VALID_CONTEXT_KEY = "test_context_key";
export const ID_FOR_SCREEN_BY_CONTEXT_KEY = "KBxnTzQs";
export const NON_EXISTENT_CONTEXT_KEY = "non_existent_test_context_key";
export const VALID_SCREEN_ID = "RkgXghGq";
export const CONTEXT_KEY_FOR_SCREEN_BY_ID = "another_test_context_key";
export const NON_EXISTENT_SCREEN_ID = "non_existent_screen_id";
