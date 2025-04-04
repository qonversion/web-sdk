import {UserPropertyKey} from './dto/UserPropertyKey';

/**
 * This builder class can be used to generate a map of user properties
 * which can be then provided to {@link QonversionInstance.setUserProperties}.
 *
 * It consumes both Qonversion defined and custom properties.
 *
 * Setting any property twice will override the previous value.
 */
export class UserPropertiesBuilder {
  private properties: Record<string, string> = {};

  /**
   * Set current user's name.
   * @param name name to set to the current user
   * @return builder instance for chain calls
   */
  setName(name: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.Name] = name;
    return this;
  }

  /**
   * Set custom user id. It can be an identifier used on your backend
   * to link the current Qonversion user with your one.
   * @param customUserId unique user id
   * @return builder instance for chain calls
   */
  setCustomUserId(customUserId: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.CustomUserId] = customUserId;
    return this;
  }

  /**
   * Set current user email address.
   * @param email email address to set to the current user
   * @return builder instance for chain calls
   */
  setEmail(email: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.Email] = email;
    return this;
  }

  /**
   * Set Kochava unique device id.
   * @param deviceId Kochava unique device id
   * @return builder instance for chain calls
   */
  setKochavaDeviceId(deviceId: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.KochavaDeviceId] = deviceId;
    return this;
  }

  /**
   * Set AppsFlyer user id. Can be used to cross-reference your in-house data
   * with AppsFlyer attribution data.
   * @param userId Appsflyer user id
   * @return builder instance for chain calls
   */
  setAppsFlyerUserId(userId: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.AppsFlyerUserId] = userId;
    return this;
  }

  /**
   * Set Adjust advertising id.
   * @param advertisingId Adjust advertising id
   * @return builder instance for chain calls
   */
  setAdjustAdvertisingId(advertisingId: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.AdjustAdId] = advertisingId;
    return this;
  }

  /**
   * Set Facebook attribution - mobile Cookie from the user's device.
   * @param facebookAttribution Facebook attribution string
   * @return builder instance for chain calls
   */
  setFacebookAttribution(facebookAttribution: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.FacebookAttribution] = facebookAttribution;
    return this;
  }

  /**
   * Set Firebase application id.
   * @param firebaseAppInstanceId firebase app id
   * @return builder instance for chain calls
   */
  setFirebaseAppInstanceId(firebaseAppInstanceId: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.FirebaseAppInstanceId] = firebaseAppInstanceId;
    return this;
  }

  /**
   * Set Android app set id.
   * @param appSetId app set id
   * @return builder instance for chain calls
   */
  setAppSetId(appSetId: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.AppSetId] = appSetId;
    return this;
  }

  /**
   * Set iOS advertising id.
   * @param advertisingId advertising id
   * @return builder instance for chain calls
   */
  setAdvertisingId(advertisingId: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.AdvertisingId] = advertisingId;
    return this;
  }

  /**
   * Set AppMetrica device id.
   * @param deviceId device id
   * @return builder instance for chain calls
   */
  setAppMetricaDeviceId(deviceId: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.AppMetricaDeviceId] = deviceId;
    return this;
  }

  /**
   * Set AppMetrica user profile id.
   * @param userProfileId user profile id
   * @return builder instance for chain calls
   */
  setAppMetricaUserProfileId(userProfileId: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.AppMetricaUserProfileId] = userProfileId;
    return this;
  }

  /**
   * Set PushWoosh hardware id.
   * @param hwId hardware id
   * @return builder instance for chain calls
   */
  setPushWooshHwId(hwId: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.PushWooshHwId] = hwId;
    return this;
  }

  /**
   * Set PushWoosh user id.
   * @param userId user id
   * @return builder instance for chain calls
   */
  setPushWooshUserId(userId: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.PushWooshUserId] = userId;
    return this;
  }

  /**
   * Set Tenjin analytics installation id.
   * @param id Tenjin analytics installation id
   * @return builder instance for chain calls
   */
  setTenjinAnalyticsInstallationId(id: string): UserPropertiesBuilder {
    this.properties[UserPropertyKey.TenjinAnalyticsInstallationId] = id;
    return this;
  }

  /**
   * Set a user property with a custom key different from defined ones.
   *
   * Can be called multiple times for different keys.
   * @param key nonempty key for user property consisting of letters A-Za-z, numbers, and symbols _.:-
   * @param value nonempty value for the given property
   */
  setCustomUserProperty(key: string, value: string): UserPropertiesBuilder {
    this.properties[key] = value;
    return this;
  }

  /**
   * Build final properties map with all the properties provided to the builder before.
   * @return properties map to provide to [Qonversion.setUserProperties] method.
   */
  build(): Record<string, string> {
    return this.properties;
  }
}
