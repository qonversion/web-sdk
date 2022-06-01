/**
 * This enum contains different available settings for Environment.
 * Provide it to the configuration object via [Qonversion.initialize] while initializing the SDK
 * or via [Qonversion.setEnvironment] after initializing the SDK.
 * The default value SDK uses is [Environment.Production].
 */
export enum Environment {
  Sandbox,
  Production
}
