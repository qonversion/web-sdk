import {
  ApiEndpoint,
  HeaderBuilder,
  NetworkRequest,
  RequestConfiguratorImpl,
  RequestHeaders,
  RequestType
} from '../../../internal/network';
import {PrimaryConfig} from '../../../types';
import {PrimaryConfigProvider} from '../../../internal';
import {UserDataProvider} from '../../../internal/user';
import {PurchaseCoreData, StripeStoreData, Environment} from '../../../index';

const testHeaders: RequestHeaders = {a: 'a'};
const headerBuilder: HeaderBuilder = {
  buildCommonHeaders(): RequestHeaders {
    return testHeaders;
  }
};
const testBaseUrl = 'test base url';
const testUserId = 'test user id'
const testProjectKey = 'test project key';

let primaryConfig: PrimaryConfig = {
  // @ts-ignore
  environment: undefined,
  launchMode: undefined,
  projectKey: testProjectKey,
  sdkVersion: ''
};
let requestConfigurator: RequestConfiguratorImpl;

describe('RequestConfigurator tests', () => {
  beforeEach(() => {
    const primaryConfigProvider: PrimaryConfigProvider = {
      getPrimaryConfig: () => primaryConfig,
    };

    // @ts-ignore
    const userDataProvider: UserDataProvider = {
      getOriginalUserId: () => testUserId,
    };

    requestConfigurator = new RequestConfiguratorImpl(headerBuilder, testBaseUrl, primaryConfigProvider, userDataProvider);
  });

  test('user request', () => {
    // given
    const expResult: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.GET,
      url: testBaseUrl + '/' + ApiEndpoint.Users + '/' + testUserId,
      body: undefined,
    };

    // when
    const request = requestConfigurator.configureUserRequest(testUserId);

    // then
    expect(request).toStrictEqual(expResult);
  });

  test('create user request', () => {
    // given
    const environment = Environment.Sandbox;
    const expResult: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.POST,
      url: `${testBaseUrl}/${ApiEndpoint.Users}/${testUserId}`,
      body: {environment},
    };

    // when
    const request = requestConfigurator.configureCreateUserRequest(testUserId, environment);

    // then
    expect(request).toStrictEqual(expResult);
  });

  test('user properties send request', () => {
    // given
    const properties = [{key: 'a', value: 'a'}, {key: 'b', value: 'b'}];
    const expResult: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.POST,
      url: testBaseUrl + '/' + ApiEndpoint.Users + '/' + testUserId + '/' + ApiEndpoint.Properties,
      body: properties,
    };

    // when
    const request = requestConfigurator.configureUserPropertiesSendRequest(testUserId, properties);

    // then
    expect(request).toStrictEqual(expResult);
  });

  test('user properties get request', () => {
    // given
    const expResult: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.GET,
      url: testBaseUrl + '/' + ApiEndpoint.Users + '/' + testUserId + '/' + ApiEndpoint.Properties,
      body: undefined,
    };

    // when
    const request = requestConfigurator.configureUserPropertiesGetRequest(testUserId);

    // then
    expect(request).toStrictEqual(expResult);
  });

  test('identity request', () => {
    // given
    const testIdentityId = 'test identity id';
    const expResult: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.GET,
      url: `${testBaseUrl}/${ApiEndpoint.Identity}/${testIdentityId}`,
      body: undefined,
    };

    // when
    const request = requestConfigurator.configureIdentityRequest(testIdentityId);

    // then
    expect(request).toStrictEqual(expResult);
  });

  test('create identity request', () => {
    // given
    const testIdentityId = 'test identity id';
    const expResult: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.POST,
      url: `${testBaseUrl}/${ApiEndpoint.Identity}/${testIdentityId}`,
      body: {
        user_id: testUserId,
      }
    };

    // when
    const request = requestConfigurator.configureCreateIdentityRequest(testUserId, testIdentityId);

    // then
    expect(request).toStrictEqual(expResult);
  });

  test('entitlements request', () => {
    // given
    const expResult: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.GET,
      url: `${testBaseUrl}/${ApiEndpoint.Users}/${testUserId}/entitlements`,
      body: undefined,
    };

    // when
    const request = requestConfigurator.configureEntitlementsRequest(testUserId);

    // then
    expect(request).toStrictEqual(expResult);
  });

  test('stripe purchase request', () => {
    // given
    const data: PurchaseCoreData & StripeStoreData = {
      currency: 'USD',
      price: '14.99',
      purchased: 124330432,
      productId: 'test product',
      subscriptionId: 'test subscription',
    };
    const expResult: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.POST,
      url: `${testBaseUrl}/${ApiEndpoint.Users}/${testUserId}/purchases`,
      body: {
        price: data.price,
        currency: data.currency,
        stripe_store_data: {
          subscription_id: data.subscriptionId,
          product_id: data.productId,
        },
        purchased: data.purchased,
      },
    };

    // when
    const request = requestConfigurator.configureStripePurchaseRequest(testUserId, data);

    // then
    expect(request).toStrictEqual(expResult);
  });
});
