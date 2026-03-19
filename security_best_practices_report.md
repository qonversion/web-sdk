# Security Best Practices Review

## Executive Summary

This review focused on API safety and reporting behavior in the browser SDK. The most important issue is that the SDK defaults to `Info` logging while several controllers log user identifiers, entitlement payloads, purchase payloads, and arbitrary user properties. The next two issues are API-contract safety problems: request paths are built from raw user-controlled identifiers without URL encoding, and non-JSON or malformed backend responses escape as raw runtime errors instead of being normalized into structured SDK errors.

## High Severity

### SBP-001: Default logging exposes identifiers and business data

**Impact:** By default, production integrations can leak user identifiers, entitlements, purchase details, and user properties into browser consoles, log collectors, and third-party debugging tooling.

- **Locations**
  - `sdk/src/QonversionConfigBuilder.ts:21`
  - `sdk/src/dto/LogLevel.ts:5`
  - `sdk/src/internal/user/UserController.ts:47`
  - `sdk/src/internal/user/UserController.ts:49`
  - `sdk/src/internal/user/UserController.ts:64`
  - `sdk/src/internal/user/UserController.ts:72`
  - `sdk/src/internal/user/UserController.ts:109`
  - `sdk/src/internal/user/UserController.ts:125`
  - `sdk/src/internal/user/UserController.ts:137`
  - `sdk/src/internal/entitlements/EntitlementsController.ts:24`
  - `sdk/src/internal/entitlements/EntitlementsController.ts:26`
  - `sdk/src/internal/purchases/PurchasesController.ts:20`
  - `sdk/src/internal/purchases/PurchasesController.ts:22`
  - `sdk/src/internal/userProperties/UserPropertiesController.ts:46`
  - `sdk/src/internal/userProperties/UserPropertiesController.ts:63`
  - `sdk/src/internal/userProperties/UserPropertiesController.ts:95`
  - `sdk/src/internal/userProperties/UserPropertiesController.ts:108`
- **Evidence**
  - The builder defaults `logLevel` to `LogLevel.Info`.
  - `LogLevel.Info` is documented as the SDK default.
  - Controllers log structured objects such as `apiUser`, `entitlements`, `userPurchase`, `propertiesToSend`, and raw identifiers.
- **Why this matters**
  - In browser environments, console output is observable by support tooling, browser extensions, shared-device users, and any script with console interception.
  - `setUserProperties` and purchase flows can include email addresses, attribution IDs, Stripe identifiers, and entitlement state.
- **Fix**
  - Change the default log level to `Warning` or `Disabled`.
  - Add redaction before logging any structured payloads.
  - Prefer event-style messages over payload dumps, for example “user request succeeded” instead of logging full user objects.
  - Consider an injectable logger sink or a `redactLogs` option for consumers that need diagnostics.
- **Mitigation**
  - Document the current behavior clearly until the default changes.
  - Avoid logging raw identifiers and user property values even at verbose levels unless explicitly opted in for development.

### SBP-002: Request paths interpolate raw identifiers without URL encoding

**Impact:** Caller-controlled IDs containing `/`, `?`, `#`, or similar characters can alter the effective request target, producing unintended routes, ambiguous reporting, and harder-to-debug authorization failures.

- **Locations**
  - `sdk/src/internal/network/RequestConfigurator.ts:35`
  - `sdk/src/internal/network/RequestConfigurator.ts:41`
  - `sdk/src/internal/network/RequestConfigurator.ts:48`
  - `sdk/src/internal/network/RequestConfigurator.ts:53`
  - `sdk/src/internal/network/RequestConfigurator.ts:58`
  - `sdk/src/internal/network/RequestConfigurator.ts:65`
  - `sdk/src/internal/network/RequestConfigurator.ts:71`
  - `sdk/src/internal/network/RequestConfigurator.ts:77`
- **Evidence**
  - All path segments are built with direct string interpolation, for example `` `${this.baseUrl}/${ApiEndpoint.Identity}/${identityId}` ``.
  - Public APIs such as `identify(userId)` and `setCustomUserProperty` accept arbitrary application-provided strings.
- **Why this matters**
  - Even if the backend rejects invalid identifiers, the SDK should not let path delimiters rewrite the request URL.
  - This is both a safety and reporting problem because malformed IDs can create confusing 404/400 patterns that do not map cleanly back to the caller input.
- **Fix**
  - Encode every path segment with `encodeURIComponent(...)` before composing URLs.
  - Wrap URL creation in a small helper so the rule applies consistently across all endpoints.
- **Mitigation**
  - Add tests for identifiers containing `/`, `?`, `#`, `%`, and spaces.

## Medium Severity

### SBP-003: Non-JSON and empty responses escape the SDK as raw runtime errors

- **Locations**
  - `sdk/src/internal/network/NetworkClient.ts:17`
  - `sdk/src/internal/network/NetworkClient.ts:19`
  - `sdk/src/internal/network/ApiInteractor.ts:51`
  - `sdk/src/internal/network/ApiInteractor.ts:55`
- **Evidence**
  - `NetworkClientImpl` always calls `response.json()`.
  - `ApiInteractorImpl` only captures `QonversionError`; other failures are rethrown unchanged.
- **Why this matters**
  - HTML error pages from a CDN/WAF, an empty `204` response, or a plain-text upstream failure become `SyntaxError`/`TypeError` instead of structured `QonversionError`.
  - That breaks the SDK’s reporting contract and weakens retry/analytics behavior because failures stop being classifiable.
- **Fix**
  - Parse based on `Content-Type`, handle empty bodies safely, and normalize parse failures into `QonversionError(QonversionErrorCode.BackendError, ...)` with preserved status code and a bounded body excerpt.
  - Introduce a transport-level error code for invalid response format if you want consumers to distinguish protocol failures from business errors.
- **Mitigation**
  - Add tests for `204`, `text/plain`, malformed JSON, and HTML error responses.

### SBP-004: Error parsing assumes `payload.error` exists and has the expected shape

- **Locations**
  - `sdk/src/internal/network/ApiInteractor.ts:84`
  - `sdk/src/internal/network/ApiInteractor.ts:86`
  - `sdk/src/internal/network/ApiInteractor.ts:89`
- **Evidence**
  - `getErrorResponse` reads `response.payload.error.message` without validating that `payload` and `payload.error` exist.
- **Why this matters**
  - A backend regression or proxy-generated error body turns an HTTP error into a local `TypeError`, which strips away the actual response context.
  - This is primarily a reporting and diagnosability weakness.
- **Fix**
  - Guard the error payload with runtime shape checks before dereferencing.
  - Fall back to a generic message that includes the HTTP status when the body is missing or malformed.
  - Consider adding a small type guard so this path stays type-safe and explicit.

### SBP-005: Persistent local storage keeps raw identifiers and user properties indefinitely

- **Locations**
  - `sdk/src/internal/common/constants.ts:2`
  - `sdk/src/internal/common/constants.ts:3`
  - `sdk/src/internal/common/constants.ts:4`
  - `sdk/src/internal/common/constants.ts:5`
  - `sdk/src/internal/common/LocalStorage.ts:21`
  - `sdk/src/internal/common/LocalStorage.ts:50`
  - `sdk/src/internal/user/UserDataStorage.ts:16`
  - `sdk/src/internal/user/UserDataStorage.ts:17`
  - `sdk/src/internal/user/UserDataStorage.ts:43`
  - `sdk/src/internal/user/UserDataStorage.ts:48`
  - `sdk/src/internal/userProperties/UserPropertiesStorage.ts:14`
  - `sdk/src/internal/userProperties/UserPropertiesStorage.ts:57`
- **Evidence**
  - The SDK stores original user IDs, identity IDs, pending properties, and sent properties in persistent `localStorage`.
- **Why this matters**
  - Browser storage is accessible to all same-origin scripts and remains on disk until cleared.
  - Some user properties called out by the public API include email addresses, attribution IDs, advertising IDs, and other analytics identifiers.
- **Fix**
  - Make storage injectable so consumers can choose `sessionStorage`, in-memory storage, or a custom persistence layer.
  - If persistence is required, document the sensitivity of stored values and consider a TTL or a narrower persisted set.
- **Mitigation**
  - At minimum, avoid persisting values that are only needed for short-lived retries or deduplication.

## Additional Improvement Opportunities

### API typing and reporting ergonomics

- `sdk/src/internal/network/types.ts:39` still uses `payload: any`; replacing this with `unknown` plus type guards would reduce unsafe assumptions around error parsing.
- `tsconfig.json:3` has `strict: true`, which is good, but adding checks such as `noUncheckedIndexedAccess`, `noImplicitOverride`, and `noPropertyAccessFromIndexSignature` would help catch protocol-shape mistakes earlier.
- Several services surface backend errors as string-concatenated messages only. A richer error object with `status`, `apiCode`, `type`, and a stable SDK error code would improve consumer-side reporting and alerting.

## Recommended Fix Order

1. Change logging defaults and redact structured payloads.
2. Encode all path segments in `RequestConfiguratorImpl`.
3. Harden transport parsing for non-JSON, empty, and malformed responses.
4. Add runtime guards for backend error shapes.
5. Introduce a configurable storage abstraction for identifiers and user properties.
