import {
  ApiEndpoint,
  IHeaderBuilder,
  NetworkRequest,
  RequestConfigurator,
  RequestHeaders,
  RequestType
} from '../../../src/internal/network';
import {PrimaryConfig} from '../../../src/types';
import {PrimaryConfigProvider} from '../../../src/internal/types';
import {IUserDataProvider} from '../../../src/internal/user';

const testHeaders: RequestHeaders = {a: 'a'};
const headerBuilder: IHeaderBuilder = {
  buildCommonHeaders(): RequestHeaders {
    return testHeaders;
  }
};
const testBaseUrl = 'test base url';
const testUserId = 'test user id'
const testProjectKey = 'test project key';

let primaryConfig: PrimaryConfig = {
  environment: undefined,
  launchMode: undefined,
  projectKey: testProjectKey,
  sdkVersion: ''
};
let requestConfigurator: RequestConfigurator;

beforeEach(() => {
  const primaryConfigProvider: PrimaryConfigProvider = {
    getPrimaryConfig(): PrimaryConfig {
      return primaryConfig;
    }
  };
  const userDataProvider: IUserDataProvider = {
    requireUserId(): string {
      return testUserId;
    },
    getUserId(): string | undefined {
      return testUserId;
    }
  };

  requestConfigurator = new RequestConfigurator(headerBuilder, testBaseUrl, primaryConfigProvider, userDataProvider);
});

test('user request', () => {
  // given
  const expResult: NetworkRequest = {
    headers: testHeaders,
    type: RequestType.GET,
    url: testBaseUrl + '/' + ApiEndpoint.Users + '/' + testUserId,
  };

  // when
  const request = requestConfigurator.configureUserRequest(testUserId);

  // then
  expect(request).toStrictEqual(expResult);
});

test('user properties request', () => {
  // given
  const properties = {a: 'a', b: 'b'};
  const expResult: NetworkRequest = {
    headers: testHeaders,
    type: RequestType.POST,
    url: testBaseUrl + '/' + ApiEndpoint.Properties,
    body: {
      access_token: testProjectKey,
      q_uid: testUserId,
      properties,
    }
  };

  // when
  const request = requestConfigurator.configureUserPropertiesRequest(properties);

  // then
  expect(request).toStrictEqual(expResult);
});
