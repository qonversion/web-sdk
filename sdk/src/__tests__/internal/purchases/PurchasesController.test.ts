import {UserDataStorage} from '../../../internal/user';
import {Logger} from '../../../internal/logger';
import {
  PaddleStoreData,
  PurchaseCoreData,
  StripeStoreData,
  UserPaddlePurchase,
  UserStripePurchase,
} from '../../../index';
import {PurchasesController, PurchasesService, PurchasesControllerImpl} from '../../../internal/purchases';

let purchasesService: PurchasesService;
let userDataStorage: UserDataStorage;
let logger: Logger;
let purchasesController: PurchasesController;

const testUserId = 'test user id';
const testUserPurchase: UserStripePurchase = {
  currency: 'USD',
  price: '10',
  purchased: 3243523432,
  stripeStoreData: {
    productId: 'test product id',
    subscriptionId: 'test subscription id'
  },
  userId: testUserId,
};

const testStripePurchaseData: PurchaseCoreData & StripeStoreData = {
  currency: 'USD',
  price: '10',
  productId: 'test product id',
  purchased: 3243523432,
  subscriptionId: 'test subscription id'
};

beforeEach(() => {
  // @ts-ignore
  purchasesService = {};
  // @ts-ignore
  userDataStorage = {};
  // @ts-ignore
  logger = {
    verbose: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  };
  purchasesController = new PurchasesControllerImpl(purchasesService, userDataStorage, logger);
});

describe('sendStripePurchase tests', () => {
  test('successfully sent', async () => {
    // given
    userDataStorage.requireOriginalUserId = jest.fn(() => testUserId);
    purchasesService.sendStripePurchase = jest.fn(async () => testUserPurchase);

    // when
    const res = await purchasesController.sendStripePurchase(testStripePurchaseData);

    // then
    expect(res).toStrictEqual(testUserPurchase);
    expect(userDataStorage.requireOriginalUserId).toBeCalled();
    expect(purchasesService.sendStripePurchase).toBeCalledWith(testUserId, testStripePurchaseData);
    expect(logger.info).toBeCalledWith('Successfully sent the Stripe purchase', testUserPurchase);
    expect(logger.verbose).toBeCalledWith('Sending Stripe purchase', {userId: testUserId, data: testStripePurchaseData});
  });

  test('unknown error while sending purchase', async () => {
    // given
    userDataStorage.requireOriginalUserId = jest.fn(() => testUserId);
    const unknownError = new Error('unknown error');
    purchasesService.sendStripePurchase = jest.fn(async () => {throw unknownError});

    // when and then
    await expect(purchasesController.sendStripePurchase(testStripePurchaseData)).rejects.toThrow(unknownError);
    expect(purchasesService.sendStripePurchase).toBeCalledWith(testUserId, testStripePurchaseData);
    expect(logger.error).toBeCalledWith('Failed to send the Stripe purchase', unknownError);
    expect(logger.verbose).toBeCalledWith('Sending Stripe purchase', {userId: testUserId, data: testStripePurchaseData});
  });
});

describe('sendPaddlePurchase tests', () => {
  const testPaddleUserPurchase: UserPaddlePurchase = {
    currency: 'USD',
    price: '9.99',
    purchased: 1716300000,
    paddleStoreData: {
      transactionId: 'txn_01hv4rrk',
      productId: 'pro_01hv4rrk',
      subscriptionId: 'sub_01hv4rrk',
      type: 'subscription',
    },
    userId: testUserId,
  };
  const testPaddleSubscriptionData: PurchaseCoreData & PaddleStoreData = {
    currency: 'USD',
    price: '9.99',
    purchased: 1716300000,
    transactionId: 'txn_01hv4rrk',
    productId: 'pro_01hv4rrk',
    subscriptionId: 'sub_01hv4rrk',
    type: 'subscription',
  };

  test('successfully sent', async () => {
    // given
    userDataStorage.requireOriginalUserId = jest.fn(() => testUserId);
    purchasesService.sendPaddlePurchase = jest.fn(async () => testPaddleUserPurchase);

    // when
    const res = await purchasesController.sendPaddlePurchase(testPaddleSubscriptionData);

    // then
    expect(res).toStrictEqual(testPaddleUserPurchase);
    expect(userDataStorage.requireOriginalUserId).toBeCalled();
    expect(purchasesService.sendPaddlePurchase).toBeCalledWith(testUserId, testPaddleSubscriptionData);
    expect(logger.info).toBeCalledWith('Successfully sent the Paddle purchase', testPaddleUserPurchase);
    expect(logger.verbose).toBeCalledWith('Sending Paddle purchase', {userId: testUserId, data: testPaddleSubscriptionData});
  });

  test('unknown error while sending purchase', async () => {
    // given
    userDataStorage.requireOriginalUserId = jest.fn(() => testUserId);
    const unknownError = new Error('unknown error');
    purchasesService.sendPaddlePurchase = jest.fn(async () => {throw unknownError});

    // when and then
    await expect(purchasesController.sendPaddlePurchase(testPaddleSubscriptionData)).rejects.toThrow(unknownError);
    expect(purchasesService.sendPaddlePurchase).toBeCalledWith(testUserId, testPaddleSubscriptionData);
    expect(logger.error).toBeCalledWith('Failed to send the Paddle purchase', unknownError);
    expect(logger.verbose).toBeCalledWith('Sending Paddle purchase', {userId: testUserId, data: testPaddleSubscriptionData});
  });
});
