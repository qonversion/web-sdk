import {UserPropertiesBuilder} from '../index';

let builder: UserPropertiesBuilder;

beforeEach(() => {
  builder = new UserPropertiesBuilder();
});

describe('UserPropertiesBuilder tests', () => {
  test('set name', () => {
    // given
    const name = "test name";
    const expProperties = {'_q_name': name};

    // when
    builder.setName(name);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set custom user id', () => {
    // given
    const id = "test id";
    const expProperties = {'_q_custom_user_id': id};

    // when
    builder.setCustomUserId(id);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set email', () => {
    // given
    const email = "test email";
    const expProperties = {'_q_email': email};

    // when
    builder.setEmail(email);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set Kochava device id', () => {
    // given
    const deviceId = "test device id";
    const expProperties = {'_q_kochava_device_id': deviceId};

    // when
    builder.setKochavaDeviceId(deviceId);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set AppsFlyer user id', () => {
    // given
    const userId = "test user id";
    const expProperties = {'_q_appsflyer_user_id': userId};

    // when
    builder.setAppsFlyerUserId(userId);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set Adjust advertising id', () => {
    // given
    const adId = "test advertising id";
    const expProperties = {'_q_adjust_adid': adId};

    // when
    builder.setAdjustAdvertisingId(adId);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set Facebook attribution', () => {
    // given
    const attribution = "test Facebook attribution";
    const expProperties = {'_q_fb_attribution': attribution};

    // when
    builder.setFacebookAttribution(attribution);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set Firebase app instance id', () => {
    // given
    const appId = "test Firebase app id";
    const expProperties = {'_q_firebase_instance_id': appId};

    // when
    builder.setFirebaseAppInstanceId(appId);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set app set id', () => {
    // given
    const appSetId = "test App Set id";
    const expProperties = {'_q_app_set_id': appSetId};

    // when
    builder.setAppSetId(appSetId);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set advertising id', () => {
    // given
    const advertisingId = "test advertising id";
    const expProperties = {'_q_advertising_id': advertisingId};

    // when
    builder.setAdvertisingId(advertisingId);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set AppMetrica device id', () => {
    // given
    const appMetricaDeviceId = "test AppMetrica device id";
    const expProperties = {'_q_appmetrica_device_id': appMetricaDeviceId};

    // when
    builder.setAppMetricaDeviceId(appMetricaDeviceId);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set AppMetrica user profile id', () => {
    // given
    const appMetricaUserProfileId = "test AppMetrica user profile id";
    const expProperties = {'_q_appmetrica_user_profile_id': appMetricaUserProfileId};

    // when
    builder.setAppMetricaUserProfileId(appMetricaUserProfileId);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set PushWoosh hardware id', () => {
    // given
    const pushWooshHwId = "test PushWoosh hw id";
    const expProperties = {'_q_pushwoosh_hwid': pushWooshHwId};

    // when
    builder.setPushWooshHwId(pushWooshHwId);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set PushWoosh user id', () => {
    // given
    const pushWooshUserId = "test PushWoosh user id";
    const expProperties = {'_q_pushwoosh_user_id': pushWooshUserId};

    // when
    builder.setPushWooshUserId(pushWooshUserId);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set Tenjin analytics installation id', () => {
    // given
    const id = "test Tenjin analytics installation id";
    const expProperties = {'_q_tenjin_aiid': id};

    // when
    builder.setTenjinAnalyticsInstallationId(id);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('set custom user property', () => {
    // given
    const key = "test key";
    const value = "test value";
    const expProperties = {[key]: value};

    // when
    builder.setCustomUserProperty(key, value);

    // then
    expect(builder['properties']).toStrictEqual(expProperties);
  });

  test('build without any properties', () => {
    // given
    const expProperties = {};

    // when
    const res = builder.build();

    // then
    expect(res).toStrictEqual(expProperties);
  });

  test('build normal way', () => {
    // given
    const expProperties = {a: 'a', b: 'b'};
    builder['properties'] = expProperties;

    // when
    const res = builder.build();

    // then
    expect(res).toStrictEqual(expProperties);
  });
});
