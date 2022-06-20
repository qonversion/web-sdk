import {UserProperty} from './dto/UserProperty';

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
    this.properties[UserProperty.Name] = name;
    return this;
  }
  
  /**
   * Set custom user id. It can be an identifier used on your backend
   * to link the current Qonversion user with your one.
   * @param customUserId unique user id
   * @return builder instance for chain calls
   */
  setCustomUserId(customUserId: string): UserPropertiesBuilder {
    this.properties[UserProperty.CustomUserId] = customUserId;
    return this;
  }

  /**
   * Set current user email address.
   * @param email email address to set to the current user
   * @return builder instance for chain calls
   */
  setEmail(email: string): UserPropertiesBuilder {
    this.properties[UserProperty.Email] = email;
    return this;
  }

  /**
   * Set Kochava unique device id.
   * @param deviceId Kochava unique device id
   * @return builder instance for chain calls
   */
  setKochavaDeviceId(deviceId: string): UserPropertiesBuilder {
    this.properties[UserProperty.KochavaDeviceId] = deviceId;
    return this;
  }

  /**
   * Set AppsFlyer user id. Can be used to cross-reference your in-house data
   * with AppsFlyer attribution data.
   * @param userId Appsflyer user id
   * @return builder instance for chain calls
   */
  setAppsFlyerUserId(userId: string): UserPropertiesBuilder {
    this.properties[UserProperty.AppsFlyerUserId] = userId;
    return this;
  }

  /**
   * Set Adjust advertising id.
   * @param advertisingId Adjust advertising id
   * @return builder instance for chain calls
   */
  setAdjustAdvertisingId(advertisingId: string): UserPropertiesBuilder {
    this.properties[UserProperty.AdjustAdId] = advertisingId;
    return this;
  }

  /**
   * Set Facebook attribution - mobile Cookie from the user's device.
   * @param facebookAttribution Facebook attribution string
   * @return builder instance for chain calls
   */
  setFacebookAttribution(facebookAttribution: string): UserPropertiesBuilder {
    this.properties[UserProperty.FacebookAttribution] = facebookAttribution;
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
