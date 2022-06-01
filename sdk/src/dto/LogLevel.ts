/**
 * This enum contains available settings for LogLevel.
 * Provide it to the configuration object via {@link Qonversion.initialize}
 * while initializing the SDK or via {@link QonversionInstance.setLogLevel}
 * after initializing the SDK. The default value SDK uses is {@link LogLevel.Info}.
 *
 * You could change the log level to make logs from the Qonversion SDK more detailed or strict.
 */
export enum LogLevel {
  // All available logs (function started, function finished, data fetched, etc)
  Verbose = 0,

  // Info level (data fetched, products loaded, user info fetched, etc)
  Info = 10,

  // Warning level (data fetched partially, sandbox env enabled for release build, etc)
  Warning = 20,

  // Error level (data fetch failed, Google billing is not available, etc)
  Error = 30,

  // Logging is disabled at all
  Disabled = Number.MAX_SAFE_INTEGER
}
