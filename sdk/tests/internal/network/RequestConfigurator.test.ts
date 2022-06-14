import {
  ApiEndpoint,
  IHeaderBuilder,
  NetworkRequest,
  RequestConfigurator,
  RequestHeaders,
  RequestType
} from '../../../src/internal/network';

const testHeaders: RequestHeaders = {a: 'a'};
const headerBuilder: IHeaderBuilder = {
  buildCommonHeaders(): RequestHeaders {
    return testHeaders;
  }
};
const testBaseUrl = 'test base url';
const testUserId = 'test user id'

const requestConfigurator = new RequestConfigurator(headerBuilder, testBaseUrl);

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
