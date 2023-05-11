import {QonversionConfigBuilder} from '../../QonversionConfigBuilder';
import {PRIVATE_TOKEN_FOR_TESTS, PROJECT_KEY_FOR_TESTS} from '../constants';
import {InternalConfig} from '../../internal';
import {DependenciesAssemblyBuilder} from '../../internal/di/DependenciesAssembly';
import {executeGrantEntitlementsRequest} from './utils';
import {expectQonversionErrorAsync, getCurrentTs} from '../utils';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// noinspection JSConstantReassignment
global.localStorage = {
  getItem: jest.fn(),
};

describe('entitlements tests', function () {
  const qonversionConfig = new QonversionConfigBuilder(PROJECT_KEY_FOR_TESTS).build();
  const internalConfig = new InternalConfig(qonversionConfig);
  const dependenciesAssembly = new DependenciesAssemblyBuilder(internalConfig).build();

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
      const entitlementResponse = await executeGrantEntitlementsRequest(PRIVATE_TOKEN_FOR_TESTS, userId, entitlementId, expires);
      const entitlement = await entitlementResponse.json();

      // when
      const res = await entitlementsService.getEntitlements(userId);

      // then
      expect(res).toEqual([entitlement]);
    });

    it('get entitlements for non-existent user', async () => {
      // given
      const userId = 'testNonExistentUserId' + Date.now();

      // when and then
      await expectQonversionErrorAsync(
        QonversionErrorCode.UserNotFound,
        'Qonversion user not found. User id: ' + userId,
        async () => {
          await entitlementsService.getEntitlements(userId);
        },
      );
    });
  });
});
