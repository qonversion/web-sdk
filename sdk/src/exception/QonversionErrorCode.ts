export enum QonversionErrorCode {
  ConfigPreparation = "Failed to prepare configuration for SDK initialization",
  NotInitialized = "Qonversion has not been initialized. You should call " +
    "the initialize method before accessing the shared instance of Qonversion",
  RequestDenied = "Request denied",
  BackendError = "Qonversion API returned an error",
  UserNotFound = "Qonversion user not found",
  IdentityNotFound = "User with requested identity not found",
}
