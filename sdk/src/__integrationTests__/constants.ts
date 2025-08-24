import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const AEGIS_URL = process.env.AEGIS_URL || '';
export const STRIPE_PRODUCT_ID = process.env.STRIPE_PRODUCT_ID || '';
export const STRIPE_SUBSCRIPTION_ID = process.env.STRIPE_SUBSCRIPTION_ID || '';
export const PROJECT_KEY_FOR_TESTS = 'PV77YHL7qnGvsdmpTs7gimsxUvY-Znl2';
export const PRIVATE_TOKEN_FOR_TESTS = 'sk_Yp-HzIBFO_mZE0YqNBeQLDrQoWmvJvSt';
export const TS_EPSILON = 100;
