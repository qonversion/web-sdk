/**
 * This enum class represents all defined user property keys
 * that can be assigned to the user. Provide these keys along with values
 * to {@link QonversionInstance.setUserProperty} method.
 * See [the documentation](https://documentation.qonversion.io/docs/web-sdk#properties) for more information
 */
export enum UserPropertyKey {
    Email = "_q_email",
    Name = "_q_name",
    KochavaDeviceId = "_q_kochava_device_id",
    AppsFlyerUserId = "_q_appsflyer_user_id",
    AdjustAdId = "_q_adjust_adid",
    CustomUserId = "_q_custom_user_id",
    FacebookAttribution = "_q_fb_attribution", // Android only
    FirebaseAppInstanceId = "_q_firebase_instance_id",
    AppSetId = "_q_app_set_id", // Android only
    AdvertisingId = "_q_advertising_id", // iOS only
    AppMetricaDeviceId = "_q_appmetrica_device_id",
    AppMetricaUserProfileId = "_q_appmetrica_user_profile_id",
    PushWooshHwId = "_q_pushwoosh_hwid",
    PushWooshUserId = "_q_pushwoosh_user_id",
    TenjinAnalyticsInstallationId = "_q_tenjin_aiid",
    Custom = "",
}
