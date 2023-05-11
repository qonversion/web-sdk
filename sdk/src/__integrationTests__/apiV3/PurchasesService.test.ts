import {PurchaseCoreData, StripeStoreData} from '../../dto/Purchase';
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

      const purchaseCoreData: PurchaseCoreData = {
        currency: 'USD',
        price: '21.49',
        purchased: getCurrentTs(),
      };
      const stripeStoreData: StripeStoreData = {
        productId: 'prod_MU1yDky0D9a8XG',
        subscriptionId: 'sub_1L3wh0L9K6ILzohYiP38XCUl'
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      // when
      const res = await purchasesService.sendStripePurchase(userId, data);

      // then
      expect(res).toBeUndefined();
    });

    it('create purchase for non-existing user', async () => {
      const userId = 'testUidForPurchase' + Date.now();

      const purchaseCoreData: PurchaseCoreData = {
        currency: 'USD',
        price: '21.49',
        purchased: getCurrentTs(),
      };
      const stripeStoreData: StripeStoreData = {
        productId: 'prod_MU1yDky0D9a8XG',
        subscriptionId: 'sub_1L3wh0L9K6ILzohYiP38XCUl'
      };

      const data = {
        ...purchaseCoreData,
        ...stripeStoreData,
      };

      // when and then
      await expectQonversionErrorAsync(
        QonversionErrorCode.UserNotFound,
        'Qonversion user not found. User id: ' + userId,
        async () => {
          await purchasesService.sendStripePurchase(userId, data);
        },
      );
    });
  });
});
