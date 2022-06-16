import {UserDataStorage} from '../../../src/internal/user';
import {Logger} from '../../../src/internal/logger';
import {PurchaseCoreData, StripeStoreData, UserPurchase} from '../../../src';
import {PurchasesController, PurchasesService, PurchasesControllerImpl} from '../../../src/internal/purchases';

let purchasesService: PurchasesService;
let userDataStorage: UserDataStorage;
let logger: Logger;
let purchasesController: PurchasesController;

const testUserId = 'test user id';
const testUserPurchase: UserPurchase = {
  currency: 'USD',
  price: 10,
  purchased: 3243523432,
  stripeStoreData: {
    productId: 'test product id',
    subscriptionId: 'test subscription id'
  },
};

const testStripePurchaseData: PurchaseCoreData & StripeStoreData = {
  currency: 'USD',
  price: 10,
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
    info: jest.fn(),
    error: jest.fn(),
  };
  purchasesController = new PurchasesControllerImpl(purchasesService, userDataStorage, logger);
});

describe('sendStripePurchase tests', () => {
  test('successfully sent', async () => {
    // given
    userDataStorage.requireUserId = jest.fn(() => testUserId);
    purchasesService.sendStripePurchase = jest.fn(async () => testUserPurchase);

    // when
    const res = await purchasesController.sendStripePurchase(testStripePurchaseData);

    // then
    expect(res).toStrictEqual(testUserPurchase);
    expect(userDataStorage.requireUserId).toBeCalled();
    expect(purchasesService.sendStripePurchase).toBeCalledWith(testUserId, testStripePurchaseData);
    expect(logger.info).toBeCalledWith('Successfully send the Stripe purchase', testUserPurchase);
  });

  test('unknown error while sending purchase', async () => {
    // given
    userDataStorage.requireUserId = jest.fn(() => testUserId);
    const unknownError = new Error('unknown error');
    purchasesService.sendStripePurchase = jest.fn(async () => {throw unknownError});

    // when and then
    await expect(purchasesController.sendStripePurchase(testStripePurchaseData)).rejects.toThrow(unknownError);
    expect(purchasesService.sendStripePurchase).toBeCalledWith(testUserId, testStripePurchaseData);
    expect(logger.error).toBeCalledWith('Failed to send the Stripe purchase', unknownError);
  });
});
