import {AEGIS_URL, PRIVATE_TOKEN_FOR_TESTS} from '../constants';
import {executeGrantEntitlementsRequest} from '../apiV3Utils';
import {getCurrentTs, getDependencyAssembly} from '../utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// noinspection JSConstantReassignment
global.localStorage = {
  getItem: jest.fn(),
};

describe('entitlements tests', function () {
  const dependenciesAssembly = getDependencyAssembly({apiUrl: AEGIS_URL});

  const userService = dependenciesAssembly.userService();
  const entitlementsService = dependenciesAssembly.entitlementsService();

  describe('GET entitlements', function () {
    it('get entitlements for new user', async () => {
      // given
      const userId = 'testEntitlementUserId' + Date.now();
      await userService.createUser(userId);

      // when
      const res = await entitlementsService.getEntitlements(userId);

      // then
      expect(res).toEqual([]);
    });

    it('get entitlements for user with entitlements', async () => {
      // given
      const userId = 'testEntitlementUserId' + Date.now();
      await userService.createUser(userId);
      const entitlementId = 'Test Permission';
      const expires = getCurrentTs() + 10000;
      const entitlementResponse = await executeGrantEntitlementsRequest(AEGIS_URL, PRIVATE_TOKEN_FOR_TESTS, userId, entitlementId, expires);
      const entitlement = await entitlementResponse.json();

      // when
      const res = await entitlementsService.getEntitlements(userId);

      // then
      expect(res).toEqual([entitlement]);
    });

    it('get entitlements for non-existent user', async () => {
      // given
      const userId = 'testNonExistentUserId' + Date.now();

      // when
      const res = await entitlementsService.getEntitlements(userId);

      // then
      expect(res).toEqual([]);
    });
  });
});
