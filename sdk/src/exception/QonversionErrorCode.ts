export enum QonversionErrorCode {
  ConfigPreparation = "Failed to prepare configuration for SDK initialization",
  NotInitialized = "Qonversion has not been initialized. You should call " +
    "the initialize method before accessing the shared instance of Qonversion",
  RequestDenied = "Request denied",
  BackendError = "Qonversion API returned an error",
  UserNotFound = "Qonversion user not found",
  IdentityNotFound = "User with requested identity not found",
  /**
   * An argument of an SDK call cannot be used: for example an empty id or an id of
   * "." or "..", which cannot be sent as a request path segment. Check the error details.
   */
  InvalidArgument = "Invalid argument",
}
