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
    configureCreateUserRequest: () => request,
    configureIdentityRequest: () => request,
    configureCreateIdentityRequest: () => request,
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

/**
 * A 2xx body that is valid JSON but not the shape a service expects (a JSON string,
 * an empty object, an object without the field) must fail the call, not become data:
 * an undefined user id would be persisted as the current user, and entitlements would
 * be read from a missing field. The fixed details prove the body is not copied.
 */
describe('success bodies of an unexpected shape through the real network chain', () => {
  const unexpectedBodies: Array<[string, string]> = [
    ['json string', JSON.stringify('Qon_other_user_id')],
    ['empty object', JSON.stringify({})],
    ['json array', JSON.stringify([])],
  ];

  describe.each(unexpectedBodies)('%s with status 200', (_name, body) => {
    test('fails identity lookup instead of resolving an undefined user id', async () => {
      // given
      respondWith(200, body);

      // when
      const error = await rejectionOf(identityService.obtainIdentity(testIdentityId));

      // then
      expect(error).toBeInstanceOf(QonversionError);
      expect(error).toMatchObject({
        code: QonversionErrorCode.BackendError,
        details: 'Unexpected identity response',
        responseCode: 200,
      });
    });

    test('fails identity creation instead of resolving an undefined user id', async () => {
      // given
      respondWith(200, body);

      // when
      const error = await rejectionOf(identityService.createIdentity(testUserId, testIdentityId));

      // then
      expect(error).toMatchObject({
        code: QonversionErrorCode.BackendError,
        details: 'Unexpected identity response',
        responseCode: 200,
      });
    });

    test('fails user lookup instead of returning a user without an id', async () => {
      // given
      respondWith(200, body);

      // when
      const error = await rejectionOf(userService.getUser(testUserId));

      // then
      expect(error).toBeInstanceOf(QonversionError);
      expect(error).toMatchObject({
        code: QonversionErrorCode.BackendError,
        details: 'Unexpected user response',
        responseCode: 200,
      });
    });

    test('fails user creation instead of returning a user without an id', async () => {
      // given
      respondWith(200, body);

      // when
      const error = await rejectionOf(userService.createUser(testUserId));

      // then
      expect(error).toMatchObject({
        code: QonversionErrorCode.BackendError,
        details: 'Unexpected user response',
        responseCode: 200,
      });
    });

    test('fails entitlements instead of returning data', async () => {
      // given
      respondWith(200, body);

      // when
      const error = await rejectionOf(entitlementsService.getEntitlements(testUserId));

      // then
      expect(error).toBeInstanceOf(QonversionError);
      expect(error).toMatchObject({
        code: QonversionErrorCode.BackendError,
        details: 'Unexpected entitlements response',
        responseCode: 200,
      });
    });
  });

  test.each([
    ['an empty user id', JSON.stringify({user_id: ''})],
    ['a numeric user id', JSON.stringify({user_id: 42})],
  ])('identity response with %s fails identity lookup', async (_name, body) => {
    // given
    respondWith(200, body);

    // when
    const error = await rejectionOf(identityService.obtainIdentity(testIdentityId));

    // then
    expect(error).toMatchObject({code: QonversionErrorCode.BackendError, responseCode: 200});
  });

  test('entitlements response whose data is not an array fails entitlements', async () => {
    // given
    respondWith(200, JSON.stringify({object: 'list', data: {}}));

    // when
    const error = await rejectionOf(entitlementsService.getEntitlements(testUserId));

    // then
    expect(error).toMatchObject({code: QonversionErrorCode.BackendError, responseCode: 200});
  });

  test('well-formed identity response resolves the user id', async () => {
    // given
    respondWith(200, JSON.stringify({user_id: testUserId}));

    // when
    const userId = await identityService.obtainIdentity(testIdentityId);

    // then
    expect(userId).toBe(testUserId);
  });

  test('well-formed user response resolves the user', async () => {
    // given
    respondWith(200, JSON.stringify({id: testUserId, identity_id: testIdentityId, created: 1, environment: 'prod'}));

    // when
    const user = await userService.getUser(testUserId);

    // then
    expect(user).toStrictEqual({id: testUserId, identityId: testIdentityId, created: 1, environment: 'prod'});
  });

  test('well-formed entitlements response resolves the list', async () => {
    // given
    respondWith(200, JSON.stringify({object: 'list', data: []}));

    // when
    const entitlements = await entitlementsService.getEntitlements(testUserId);

    // then
    expect(entitlements).toStrictEqual([]);
  });
});
