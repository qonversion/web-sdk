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
    FacebookAttribution = "_q_fb_attribution",
    FirebaseAppInstanceId = "_q_firebase_instance_id",
    AppSetId = "_q_app_set_id",
    AdvertisingId = "_q_advertising_id",
    Custom = "",
}
