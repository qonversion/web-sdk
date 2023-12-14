import {PurchaseCoreData, StripeStoreData, UserPurchase} from '../../dto/Purchase';
import {getCurrentTs, getDependencyAssembly} from '../utils';
import {AEGIS_URL} from '../constants';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// noinspection JSConstantReassignment
global.localStorage = {
  getItem: jest.fn(),
};

const stripeProductId = 'prod_ObGxAn4MF9PQvi';
const stripeSubscriptionId = 'sub_1ONCxeHj4b8RrJvcJ2FEP08A';

describe('purchases tests', function () {
  const dependenciesAssembly = getDependencyAssembly({apiUrl: AEGIS_URL});

  const userService = dependenciesAssembly.userService();
  const purchasesService = dependenciesAssembly.purchasesService();

  describe('POST purchases', () => {
    it('create correct purchase', async () => {
      // given
      const userId = 'testUidForPurchase' + Date.now();
      await userService.createUser(userId);

      const purchased = getCurrentTs();
      const purchaseCoreData: PurchaseCoreData = {
        currency: 'USD',
        price: '21.49',
        purchased,
      };
      const stripeStoreData: StripeStoreData = {
        productId: stripeProductId,
        subscriptionId: stripeSubscriptionId,
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      const expRes: UserPurchase = {
        ...purchaseCoreData,
        purchased,
        stripeStoreData,
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
        currency: 'USD',
        price: '21.49',
      };
      const stripeStoreData: StripeStoreData = {
        productId: stripeProductId,
        subscriptionId: stripeSubscriptionId,
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

      const purchased = getCurrentTs();
      const purchaseCoreData: PurchaseCoreData = {
        currency: 'USD',
        price: '21.49',
        purchased,
      };
      const stripeStoreData: StripeStoreData = {
        productId: stripeProductId,
        subscriptionId: stripeSubscriptionId,
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      const expRes: UserPurchase = {
        ...purchaseCoreData,
        purchased,
        stripeStoreData,
        userId,
      };

      // when
      const res = await purchasesService.sendStripePurchase(userId, data);

      // then
      expect(res).toEqual(expRes);
    });

    it('create purchase with incorrect subscription id', async () => {
      const userId = 'testUidForPurchase' + Date.now();
      await userService.createUser(userId);

      const purchased = getCurrentTs();
      const purchaseCoreData: PurchaseCoreData = {
        currency: 'USD',
        price: '21.49',
        purchased,
      };
      const stripeStoreData: StripeStoreData = {
        productId: stripeProductId,
        subscriptionId: 'incorrect subscription id'
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      const expRes: UserPurchase = {
        ...purchaseCoreData,
        purchased,
        stripeStoreData,
        userId,
      };

      // when
      const res = await purchasesService.sendStripePurchase(userId, data);

      // then
      expect(res).toEqual(expRes);
    });

    it('create purchase with incorrect amount', async () => {
      const userId = 'testUidForPurchase' + Date.now();
      await userService.createUser(userId);

      const purchased = getCurrentTs();
      const purchaseCoreData: PurchaseCoreData = {
        currency: 'USD',
        price: '21,49',
        purchased,
      };
      const stripeStoreData: StripeStoreData = {
        productId: stripeProductId,
        subscriptionId: stripeSubscriptionId,
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      const expRes: UserPurchase = {
        ...purchaseCoreData,
        purchased,
        stripeStoreData,
        userId,
      };

      // when
      const res = await purchasesService.sendStripePurchase(userId, data);

      // then
      expect(res).toEqual(expRes);
    });

    it('create purchase with incorrect currency', async () => {
      const userId = 'testUidForPurchase' + Date.now();
      await userService.createUser(userId);

      const purchased = getCurrentTs();
      const purchaseCoreData: PurchaseCoreData = {
        currency: 'USDDD',
        price: '21.49',
        purchased,
      };
      const stripeStoreData: StripeStoreData = {
        productId: stripeProductId,
        subscriptionId: stripeSubscriptionId,
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      const expRes: UserPurchase = {
        ...purchaseCoreData,
        purchased,
        stripeStoreData,
        userId,
      };

      // when
      const res = await purchasesService.sendStripePurchase(userId, data);

      // then
      expect(res).toEqual(expRes);
    });
  });
});
