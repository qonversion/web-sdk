import {
  ApiInteractor,
  RequestConfigurator,
  NetworkRequest,
  NetworkResponseError,
  NetworkResponseSuccess
} from '../../../internal/network';
import {
  Entitlement,
  EntitlementSource,
  PeriodType,
  QonversionError,
  QonversionErrorCode,
  RenewState
} from '../../../index';
import {HTTP_CODE_NOT_FOUND} from '../../../internal/network/constants';
import {
  EntitlementApi,
  EntitlementsResponse,
  EntitlementsService,
  EntitlementsServiceImpl
} from '../../../internal/entitlements';

let requestConfigurator: RequestConfigurator;
let apiInteractor: ApiInteractor;
let entitlementsService: EntitlementsService;
const testUserId = 'test user id';

const apiEntitlement: EntitlementApi = {
  active: true,
  started: 10,
  expires: 100,
  id: 'test entitlement',
  product: {
    product_id: 'test product',
    subscription: {
      current_period_type: PeriodType.Trial,
      renew_state: RenewState.WillRenew,
    },
  },
};

const apiPayload: EntitlementsResponse = {
  data: [apiEntitlement],
  object: 'list'
};
const testSuccessfulResponse: NetworkResponseSuccess<EntitlementsResponse> = {
  code: 200,
  data: apiPayload,
  isSuccess: true
};
const testErrorCode = 500;
const testErrorMessage = 'Test error message';
const testErrorResponse: NetworkResponseError = {
  code: testErrorCode,
  apiCode: '',
  message: testErrorMessage,
  type: '',
  isSuccess: false,
};
const expRes: Entitlement[] = [{
  active: true,
  started: 10,
  expires: 100,
  id: 'test entitlement',
  source: EntitlementSource.Stripe,
  product: {
    productId: 'test product',
    subscription: {
      currentPeriodType: PeriodType.Trial,
      renewState: RenewState.WillRenew,
    },
  },
}];

beforeEach(() => {
  // @ts-ignore
  requestConfigurator = {};
  // @ts-ignore
  apiInteractor = {};

  entitlementsService = new EntitlementsServiceImpl(requestConfigurator, apiInteractor);
});

describe('getEntitlements tests', function () {
  // @ts-ignore
  const testRequest: NetworkRequest = {a: 'aa'};

  test('entitlements successfully received', async () => {
    // given
    requestConfigurator.configureEntitlementsRequest = jest.fn(() => testRequest);
    // @ts-ignore
    apiInteractor.execute = jest.fn(async () => testSuccessfulResponse);

    // when
    const res = await entitlementsService.getEntitlements(testUserId);

    // then
    expect(res).toStrictEqual(expRes);
    expect(requestConfigurator.configureEntitlementsRequest).toBeCalledWith(testUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('entitlements request failed', async () => {
    // given
    requestConfigurator.configureEntitlementsRequest = jest.fn(() => testRequest);
    apiInteractor.execute = jest.fn(async () => testErrorResponse);
    const expError = new QonversionError(
      QonversionErrorCode.BackendError,
      `Response code ${testErrorCode}, message: ${testErrorMessage}`,
    );

    // when and then
    await expect(() => entitlementsService.getEntitlements(testUserId)).rejects.toThrow(expError);
    expect(requestConfigurator.configureEntitlementsRequest).toBeCalledWith(testUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('user does not exist', async () => {
    // given
    const testUserNotFoundResponse: NetworkResponseError = {
      code: HTTP_CODE_NOT_FOUND,
      apiCode: '',
      message: testErrorMessage,
      type: '',
      isSuccess: false,
    };
    requestConfigurator.configureEntitlementsRequest = jest.fn(() => testRequest);
    apiInteractor.execute = jest.fn(async () => testUserNotFoundResponse);
    const expError = new QonversionError(
      QonversionErrorCode.UserNotFound,
      `User id: ${testUserId}`,
    );

    // when and then
    await expect(() => entitlementsService.getEntitlements(testUserId)).rejects.toThrow(expError);
    expect(requestConfigurator.configureEntitlementsRequest).toBeCalledWith(testUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });
});
