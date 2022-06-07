import {DAYS_IN_MONTH, DAYS_IN_WEEK, SEC_IN_DAY} from "../internal/utils/dateUtils";

/**
 * The Qonversion SDK caches some information from the billing library or API.
 * This enum contains different available settings for cache lifetime.
 * Provide it to the configuration object via {@link Qonversion.initialize} while initializing the SDK
 * or via {@link QonversionInstance.setCacheLifetime} after initializing the SDK.
 * The provided value is used for case when user internet connection is not stable.
 * Cache lifetime for normal cases is much less and is not configurable.
 * Let's say we have user info loaded and cached a day before yesterday.
 * If the cache lifetime is set to {@link CacheLifetime.ThreeDays} and you request user info when
 * the internet connection is not stable, then the cached value will be returned.
 * But if the internet connection is okay or the cache lifetime is set to {@link CacheLifetime.OneDay},
 * then cached data will be renewed and then returned.
 *
 * The default value is {@link CacheLifetime.ThreeDays}.
 */
export enum CacheLifetime {
  OneDay = SEC_IN_DAY,
  TwoDays = 2 * SEC_IN_DAY,
  ThreeDays = 3 * SEC_IN_DAY,
  Week = DAYS_IN_WEEK * SEC_IN_DAY,
  TwoWeeks = 2 * DAYS_IN_WEEK * SEC_IN_DAY,
  Month = DAYS_IN_MONTH * SEC_IN_DAY
}
