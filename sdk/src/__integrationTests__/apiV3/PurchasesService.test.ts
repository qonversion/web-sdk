import {PurchaseCoreData, StripeStoreData, UserPurchase} from '../../dto/Purchase';
import {expectQonversionErrorAsync, getCurrentTs, getDependencyAssembly} from '../utils';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// noinspection JSConstantReassignment
global.localStorage = {
  getItem: jest.fn(),
};

describe('purchases tests', function () {
  const dependenciesAssembly = getDependencyAssembly();

  const userService = dependenciesAssembly.userService();
  const purchasesService = dependenciesAssembly.purchasesService();

  describe('POST purchases', () => {
    it('create correct purchase', async () => {
      // given
      const userId = 'testUidForPurchase' + Date.now();
      await userService.createUser(userId);

      const purchased = getCurrentTs();
      const purchaseCoreData: PurchaseCoreData = {
        currency: 'EUR',
        price: '5.00',
        purchased,
      };
      const stripeStoreData: StripeStoreData = {
        productId: 'prod_OSEBvB33YUIOpu',
        subscriptionId: 'sub_1NfJsSHj4b8RrJvc78ALkOzh'
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      const expRes: UserPurchase = {
        ...purchaseCoreData,
        stripeStoreData,
        purchased: Math.floor(purchased / 1000) * 1000,
        userId,
      };

      // when
      const res = await purchasesService.sendStripePurchase(userId, data);

      // then
      expect(res).toEqual(expRes);
    });

    it('create purchase without purchase time', async () => {
      // given
      const userId = 'testUidForPurchase' + Date.now();
      await userService.createUser(userId);

      const purchaseCoreData: PurchaseCoreData = {
        currency: 'EUR',
        price: '5.00',
      };
      const stripeStoreData: StripeStoreData = {
        productId: 'prod_OSEBvB33YUIOpu',
        subscriptionId: 'sub_1NfJsSHj4b8RrJvc78ALkOzh'
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      const expRes: UserPurchase = {
        ...purchaseCoreData,
        stripeStoreData,
        purchased: 0,
        userId,
      };

      // when
      const res = await purchasesService.sendStripePurchase(userId, data);

      // then
      expect(res).toEqual(expRes);
    });

    it('create purchase for non-existing user', async () => {
      const userId = 'testUidForPurchase' + Date.now();

      const purchaseCoreData: PurchaseCoreData = {
        currency: 'EUR',
        price: '5.00',
        purchased: getCurrentTs(),
      };
      const stripeStoreData: StripeStoreData = {
        productId: 'prod_OSEBvB33YUIOpu',
        subscriptionId: 'sub_1NfJsSHj4b8RrJvc78ALkOzh'
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      // when and then
      await expectQonversionErrorAsync(
        QonversionErrorCode.UserNotFound,
        'Qonversion user not found. Id: ' + userId,
        async () => {
          await purchasesService.sendStripePurchase(userId, data);
        },
      );
    });

    it('create purchase with incorrect subscription id', async () => {
      const userId = 'testUidForPurchase' + Date.now();
      await userService.createUser(userId);

      const purchaseCoreData: PurchaseCoreData = {
        currency: 'EUR',
        price: '5.00',
        purchased: getCurrentTs(),
      };
      const stripeStoreData: StripeStoreData = {
        productId: 'prod_OSEBvB33YUIOpu',
        subscriptionId: 'incorrect subscription id'
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      // when and then
      await expectQonversionErrorAsync(
        QonversionErrorCode.BackendError,
        'Qonversion API returned an error. Response code 422, message: Couldn\'t validate purchase with store request, potential fraud',
        async () => {
          await purchasesService.sendStripePurchase(userId, data);
        },
      );
    });

    it('create purchase with incorrect amount', async () => {
      const userId = 'testUidForPurchase' + Date.now();
      await userService.createUser(userId);

      const purchaseCoreData: PurchaseCoreData = {
        currency: 'EUR',
        price: '5,00',
        purchased: getCurrentTs(),
      };
      const stripeStoreData: StripeStoreData = {
        productId: 'prod_OSEBvB33YUIOpu',
        subscriptionId: 'sub_1NfJsSHj4b8RrJvc78ALkOzh'
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      // when and then
      await expectQonversionErrorAsync(
        QonversionErrorCode.BackendError,
        'Qonversion API returned an error. Response code 400, message: failed to parse price',
        async () => {
          await purchasesService.sendStripePurchase(userId, data);
        },
      );
    });

    it('create purchase with incorrect currency', async () => {
      const userId = 'testUidForPurchase' + Date.now();
      await userService.createUser(userId);

      const purchaseCoreData: PurchaseCoreData = {
        currency: 'EURRR',
        price: '5.00',
        purchased: getCurrentTs(),
      };
      const stripeStoreData: StripeStoreData = {
        productId: 'prod_OSEBvB33YUIOpu',
        subscriptionId: 'sub_1NfJsSHj4b8RrJvc78ALkOzh'
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      // when and then
      await expectQonversionErrorAsync(
        QonversionErrorCode.BackendError,
        'Qonversion API returned an error. Response code 400, message: failed to recognize currency',
        async () => {
          await purchasesService.sendStripePurchase(userId, data);
        },
      );
    });
  });
});
