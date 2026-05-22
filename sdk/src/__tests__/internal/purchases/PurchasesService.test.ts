import {
  ApiInteractor,
  RequestConfigurator,
  NetworkRequest,
  ApiResponseError,
  ApiResponseSuccess
} from '../../../internal/network';
import {
  PaddleStoreData,
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
  userId: testUserId,
  stripe_store_data: {
    product_id: 'test product id',
    subscription_id: 'test subscription id'
  },
};

const testSuccessfulResponse: ApiResponseSuccess<UserPurchaseApi> = {
  code: 200,
  data: apiPurchase,
  isSuccess: true
};
const testErrorCode = 500;
const testErrorMessage = 'Test error message';
const testErrorResponse: ApiResponseError = {
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
  userId: testUserId,
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

describe('sendPaddlePurchase tests', function () {
  // @ts-ignore
  const testRequest: NetworkRequest = {a: 'bb'};

  const apiPaddlePurchase: UserPurchaseApi = {
    currency: 'USD',
    price: '9.99',
    purchased: 1716300000,
    userId: testUserId,
    paddle_store_data: {
      transaction_id: 'txn_01hv4rrk',
      customer_id: 'ctm_01hv4rrk',
      product_id: 'pro_01hv4rrk',
      subscription_id: 'sub_01hv4rrk',
      type: 'subscription',
    },
  };
  const testPaddleSuccessResponse: ApiResponseSuccess<UserPurchaseApi> = {
    code: 200,
    data: apiPaddlePurchase,
    isSuccess: true,
  };
  const expPaddleRes: UserPurchase = {
    currency: 'USD',
    price: '9.99',
    purchased: 1716300000,
    userId: testUserId,
    paddleStoreData: {
      transactionId: 'txn_01hv4rrk',
      customerId: 'ctm_01hv4rrk',
      productId: 'pro_01hv4rrk',
      subscriptionId: 'sub_01hv4rrk',
      type: 'subscription',
    },
  };
  const testPaddlePurchaseRequest: PurchaseCoreData & PaddleStoreData = {
    currency: 'USD',
    price: '9.99',
    purchased: 1716300000,
    transactionId: 'txn_01hv4rrk',
    customerId: 'ctm_01hv4rrk',
    productId: 'pro_01hv4rrk',
    subscriptionId: 'sub_01hv4rrk',
    type: 'subscription',
  };

  test('purchase successfully sent', async () => {
    // given
    requestConfigurator.configurePaddlePurchaseRequest = jest.fn(() => testRequest);
    // @ts-ignore
    apiInteractor.execute = jest.fn(async () => testPaddleSuccessResponse);

    // when
    const res = await purchasesService.sendPaddlePurchase(testUserId, testPaddlePurchaseRequest);

    // then
    expect(res).toStrictEqual(expPaddleRes);
    expect(requestConfigurator.configurePaddlePurchaseRequest).toBeCalledWith(testUserId, testPaddlePurchaseRequest);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('send purchase request failed', async () => {
    // given
    requestConfigurator.configurePaddlePurchaseRequest = jest.fn(() => testRequest);
    apiInteractor.execute = jest.fn(async () => testErrorResponse);
    const expError = new QonversionError(
      QonversionErrorCode.BackendError,
      `Response code ${testErrorCode}, message: ${testErrorMessage}`,
    );

    // when and then
    await expect(() => purchasesService.sendPaddlePurchase(testUserId, testPaddlePurchaseRequest)).rejects.toThrow(expError);
    expect(requestConfigurator.configurePaddlePurchaseRequest).toBeCalledWith(testUserId, testPaddlePurchaseRequest);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });
});
