/**
 * This enum contains different available settings for Environment.
 * Provide it to the configuration object via {@link Qonversion.initialize}
 * while initializing the SDK or via {@link QonversionInstance.setEnvironment}
 * after initializing the SDK. The default value SDK uses is {@link Environment.Production}.
 */
export enum Environment {
  Sandbox = 'sandbox',
  Production = 'prod',
}
