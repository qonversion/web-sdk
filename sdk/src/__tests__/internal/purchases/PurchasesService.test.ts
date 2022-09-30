import {
  ApiInteractor,
  RequestConfigurator,
  NetworkRequest,
  NetworkResponseError,
  NetworkResponseSuccess
} from '../../../internal/network';
import {
  PurchaseCoreData,
  QonversionError,
  QonversionErrorCode,
  StripeStoreData,
  UserPurchase
} from '../../../index';
import {PurchaseServiceImpl, PurchasesService, UserPurchaseApi} from '../../../internal/purchases';

let requestConfigurator: RequestConfigurator;
let apiInteractor: ApiInteractor;
let purchasesService: PurchasesService;
const testUserId = 'test user id';

const apiPurchase: UserPurchaseApi = {
  currency: 'USD',
  price: '10',
  purchased: 3243523432,
  stripe_store_data: {
    product_id: 'test product id',
    subscription_id: 'test subscription id'
  },
};

const testSuccessfulResponse: NetworkResponseSuccess<UserPurchaseApi> = {
  code: 200,
  data: apiPurchase,
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
const expRes: UserPurchase = {
  currency: 'USD',
  price: '10',
  purchased: 3243523432,
  stripeStoreData: {
    productId: 'test product id',
    subscriptionId: 'test subscription id'
  },
};

const testStripePurchaseRequest: PurchaseCoreData & StripeStoreData = {
  currency: 'USD',
  price: '10',
  productId: 'test product id',
  purchased: 3243523432,
  subscriptionId: 'test subscription id'
};

beforeEach(() => {
  // @ts-ignore
  requestConfigurator = {};
  // @ts-ignore
  apiInteractor = {};

  purchasesService = new PurchaseServiceImpl(requestConfigurator, apiInteractor);
});

describe('sendStripePurchase tests', function () {
  // @ts-ignore
  const testRequest: NetworkRequest = {a: 'aa'};

  test('purchase successfully sent', async () => {
    // given
    requestConfigurator.configureStripePurchaseRequest = jest.fn(() => testRequest);
    // @ts-ignore
    apiInteractor.execute = jest.fn(async () => testSuccessfulResponse);

    // when
    const res = await purchasesService.sendStripePurchase(testUserId, testStripePurchaseRequest);

    // then
    expect(res).toStrictEqual(expRes);
    expect(requestConfigurator.configureStripePurchaseRequest).toBeCalledWith(testUserId, testStripePurchaseRequest);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('send purchase request failed', async () => {
    // given
    requestConfigurator.configureStripePurchaseRequest = jest.fn(() => testRequest);
    apiInteractor.execute = jest.fn(async () => testErrorResponse);
    const expError = new QonversionError(
      QonversionErrorCode.BackendError,
      `Response code ${testErrorCode}, message: ${testErrorMessage}`,
    );

    // when and then
    await expect(() => purchasesService.sendStripePurchase(testUserId, testStripePurchaseRequest)).rejects.toThrow(expError);
    expect(requestConfigurator.configureStripePurchaseRequest).toBeCalledWith(testUserId, testStripePurchaseRequest);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });
});
