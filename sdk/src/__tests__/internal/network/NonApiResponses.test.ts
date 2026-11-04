import {
  ApiInteractorImpl,
  ExponentialDelayCalculator,
  NetworkClientImpl,
  NetworkRequest,
  RequestConfigurator,
  RequestType,
  RetryPolicyNone,
} from '../../../internal/network';
import {NetworkConfigHolder, PrimaryConfigProvider} from '../../../internal';
import {EntitlementsServiceImpl} from '../../../internal/entitlements';
import {IdentityServiceImpl, UserServiceImpl} from '../../../internal/user';
import {Environment, QonversionError, QonversionErrorCode} from '../../../index';

/**
 * Responses that do not come from the Qonversion API (a proxy error page, a captive
 * portal, an empty body) must never be read by status code or returned as data.
 * These tests drive the real NetworkClient -> ApiInteractor -> service chain with
 * fetch stubbed, because the hazard surfaces in the services: a 404 read as
 * "user not found" makes the SDK recreate the user or re-link the identity, and a
 * 200 read as success makes identify() persist an undefined user id.
 */

const request: NetworkRequest = {
  headers: {},
  type: RequestType.GET,
  url: 'https://api.test/v3/anything',
};
const testUserId = 'Qon_test_user_id';
const testIdentityId = 'test identity id';

const htmlPage = '<html><body>Not the API</body></html>';
const apiNotFoundBody = JSON.stringify({error: {message: 'Not found', type: 'request', code: 'not_found'}});

let userService: UserServiceImpl;
let identityService: IdentityServiceImpl;
let entitlementsService: EntitlementsServiceImpl;

const savedFetch = global.fetch;
const mockFetch = jest.fn();

const respondWith = (status: number, body: string) => {
  mockFetch.mockImplementationOnce(() =>
    Promise.resolve({
      status,
      headers: {get: () => null},
      text: () => Promise.resolve(body),
    })
  );
};

const rejectionOf = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    await promise;
  } catch (e) {
    return e;
  }
  throw new Error('Expected the promise to reject');
};

beforeAll(() => {
  Object.defineProperty(global, 'fetch', {
    writable: true,
  });
  // @ts-ignore
  global.fetch = mockFetch;
});

afterAll(() => {
  global.fetch = savedFetch;
});

beforeEach(() => {
  mockFetch.mockReset();

  const networkConfigHolder: NetworkConfigHolder = {
    canSendRequests: () => true,
    setCanSendRequests: () => undefined,
  };
  const apiInteractor = new ApiInteractorImpl(
    new NetworkClientImpl(),
    new ExponentialDelayCalculator(),
    networkConfigHolder,
    new RetryPolicyNone(),
  );
  const primaryConfigProvider: PrimaryConfigProvider = {
    getPrimaryConfig: () => ({projectKey: 'test project key', environment: Environment.Production, sdkVersion: '0'}),
  };
  // @ts-ignore only the request builders used by the services under test are stubbed
  const requestConfigurator: RequestConfigurator = {
    configureUserRequest: () => request,
    configureIdentityRequest: () => request,
    configureEntitlementsRequest: () => request,
  };

  userService = new UserServiceImpl(primaryConfigProvider, requestConfigurator, apiInteractor);
  identityService = new IdentityServiceImpl(requestConfigurator, apiInteractor);
  entitlementsService = new EntitlementsServiceImpl(requestConfigurator, apiInteractor);
});

describe('non-API responses through the real network chain', () => {
  test('html page with status 200 fails identity lookup instead of resolving an empty user id', async () => {
    // given
    respondWith(200, htmlPage);

    // when
    const error = await rejectionOf(identityService.obtainIdentity(testIdentityId));

    // then
    expect(error).toBeInstanceOf(QonversionError);
    expect(error).toMatchObject({code: QonversionErrorCode.BackendError, responseCode: 200});
  });

  test('html page with status 200 fails entitlements instead of returning data', async () => {
    // given
    respondWith(200, htmlPage);

    // when
    const error = await rejectionOf(entitlementsService.getEntitlements(testUserId));

    // then
    expect(error).toMatchObject({code: QonversionErrorCode.BackendError, responseCode: 200});
  });

  test('html page with status 404 is not identity-not-found', async () => {
    // given
    respondWith(404, htmlPage);

    // when
    const error = await rejectionOf(identityService.obtainIdentity(testIdentityId));

    // then
    expect(error).toBeInstanceOf(QonversionError);
    expect(error).toMatchObject({code: QonversionErrorCode.BackendError, responseCode: 404});
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('html page with status 404 is not user-not-found', async () => {
    // given
    respondWith(404, htmlPage);

    // when
    const error = await rejectionOf(userService.getUser(testUserId));

    // then
    expect(error).toMatchObject({code: QonversionErrorCode.BackendError, responseCode: 404});
  });

  test('empty body with status 404 is not user-not-found', async () => {
    // given
    respondWith(404, '');

    // when
    const error = await rejectionOf(userService.getUser(testUserId));

    // then
    expect(error).toMatchObject({code: QonversionErrorCode.BackendError, responseCode: 404});
  });

  test('json body without an api error with status 404 is not user-not-found', async () => {
    // given
    respondWith(404, JSON.stringify({status: 404}));

    // when
    const error = await rejectionOf(userService.getUser(testUserId));

    // then
    expect(error).toMatchObject({code: QonversionErrorCode.BackendError, responseCode: 404});
  });

  test('empty body with status 404 is not user-not-found for entitlements', async () => {
    // given
    respondWith(404, '');

    // when
    const error = await rejectionOf(entitlementsService.getEntitlements(testUserId));

    // then
    expect(error).toMatchObject({code: QonversionErrorCode.BackendError, responseCode: 404});
  });

  test('api error with status 404 is user-not-found', async () => {
    // given
    respondWith(404, apiNotFoundBody);

    // when
    const error = await rejectionOf(userService.getUser(testUserId));

    // then
    expect(error).toMatchObject({code: QonversionErrorCode.UserNotFound});
  });

  test('api error with status 404 is identity-not-found', async () => {
    // given
    respondWith(404, apiNotFoundBody);

    // when
    const error = await rejectionOf(identityService.obtainIdentity(testIdentityId));

    // then
    expect(error).toMatchObject({code: QonversionErrorCode.IdentityNotFound});
  });
});
