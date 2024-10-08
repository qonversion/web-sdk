import {AEGIS_URL, PRIVATE_TOKEN_FOR_TESTS, PROJECT_KEY_FOR_TESTS, TS_EPSILON} from '../constants';
import {getCurrentTs, getDependencyAssembly} from '../utils';
import {executeGrantEntitlementsRequest, executeRevokeEntitlementsRequest} from '../apiV3Utils';
import {Entitlement, EntitlementSource} from '../../dto/Entitlement';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// noinspection JSConstantReassignment
global.localStorage = {
  getItem: jest.fn(),
};

describe('Direct API tests', function () {
  const dependenciesAssembly = getDependencyAssembly({apiUrl: AEGIS_URL});
  const userService = dependenciesAssembly.userService();

  describe('Grant entitlements', function () {
    it('grant entitlement', async () => {
      // given
      const userId = 'testGrantEntitlementUid' + Date.now();
      await userService.createUser(userId);

      const entitlementId = 'test_permission';
      const expires = getCurrentTs() + 10000;

      const expRes: Entitlement = {
        active: true,
        expires,
        id: entitlementId,
        source: EntitlementSource.Manual,
        started: 0,
      };
      const requestStartTs = getCurrentTs();

      // when
      const response = await executeGrantEntitlementsRequest(AEGIS_URL, PRIVATE_TOKEN_FOR_TESTS, userId, entitlementId, expires);
      const requestEndTs = getCurrentTs();
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(200);
      expect(responseBody.started).toBeGreaterThanOrEqual(requestStartTs - TS_EPSILON);
      expect(responseBody.started).toBeLessThanOrEqual(requestEndTs + TS_EPSILON);
      expRes.started = responseBody.started;
      expect(responseBody).toEqual(expRes);
    });

    it('grant entitlement twice', async () => {
      // given
      const userId = 'testGrantEntitlementUid' + Date.now();
      await userService.createUser(userId);

      const entitlementId = 'test_permission';
      const expiresOld = getCurrentTs() + 1000;
      await executeGrantEntitlementsRequest(AEGIS_URL, PRIVATE_TOKEN_FOR_TESTS, userId, entitlementId, expiresOld);

      const expiresNew = getCurrentTs() + 10000;
      const expRes: Entitlement = {
        active: true,
        expires: expiresNew,
        id: entitlementId,
        source: EntitlementSource.Manual,
        started: 0,
      };
      const requestStartTs = getCurrentTs();

      // when
      const response = await executeGrantEntitlementsRequest(AEGIS_URL, PRIVATE_TOKEN_FOR_TESTS, userId, entitlementId, expiresNew);
      const requestEndTs = getCurrentTs();
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(200);
      expect(responseBody.started).toBeGreaterThanOrEqual(requestStartTs - TS_EPSILON);
      expect(responseBody.started).toBeLessThanOrEqual(requestEndTs + TS_EPSILON);
      expRes.started = responseBody.started;
      expect(responseBody).toEqual(expRes);
    });

    it('grant entitlement with wrong expires', async () => {
      // given
      const userId = 'testGrantEntitlementUid' + Date.now();
      await userService.createUser(userId);

      const entitlementId = 'test_permission';
      const expires = getCurrentTs() - 10000;

      const expError = {
        code: 'invalid_entitlement_data',
        message: 'Invalid expires at value has been provided, should be in unix timestamp format in seconds in future',
        type: 'request',
      };

      // when
      const response = await executeGrantEntitlementsRequest(AEGIS_URL, PRIVATE_TOKEN_FOR_TESTS, userId, entitlementId, expires);
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(400);
      expect(responseBody.error).toEqual(expError);
    });

    it('grant entitlement with wrong token', async () => {
      // given
      const userId = 'testGrantEntitlementUid' + Date.now();
      await userService.createUser(userId);

      const entitlementId = 'test_permission';
      const expires = getCurrentTs() + 10000;

      const expError = {
        code: 'control_unauthorized',
        message: 'Authorization error: project not found',
        type: 'request',
      };

      // when
      const response = await executeGrantEntitlementsRequest(AEGIS_URL, PROJECT_KEY_FOR_TESTS, userId, entitlementId, expires);
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(400);
      expect(responseBody.error).toEqual(expError);
    });

    it('grant entitlement for non-existent user', async () => {
      // given
      const userId = 'testNonExistentUid' + Date.now();

      const entitlementId = 'Non existent entitlement';
      const expires = getCurrentTs() + 10000;

      const expRes: Entitlement = {
        active: true,
        expires,
        id: entitlementId,
        source: EntitlementSource.Manual,
        started: 0,
      };
      const requestStartTs = getCurrentTs();

      // when
      const response = await executeGrantEntitlementsRequest(AEGIS_URL, PRIVATE_TOKEN_FOR_TESTS, userId, entitlementId, expires);
      const requestEndTs = getCurrentTs();
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(200);
      expect(responseBody.started).toBeGreaterThanOrEqual(requestStartTs - TS_EPSILON);
      expect(responseBody.started).toBeLessThanOrEqual(requestEndTs + TS_EPSILON);
      expRes.started = responseBody.started;
      expect(responseBody).toEqual(expRes);
    });
  });

  describe('Revoke entitlements', function () {
    it('revoke existing entitlement', async () => {
      // given
      const userId = 'testGrantEntitlementUid' + Date.now();
      await userService.createUser(userId);

      const entitlementId = 'test_permission';
      const expires = getCurrentTs() + 10000;
      await executeGrantEntitlementsRequest(AEGIS_URL, PRIVATE_TOKEN_FOR_TESTS, userId, entitlementId, expires);

      // when
      const response = await executeRevokeEntitlementsRequest(AEGIS_URL, PRIVATE_TOKEN_FOR_TESTS, userId, entitlementId);

      // then
      expect(response.status).toBe(200);
    });

    it('revoke non-existent entitlement', async () => {
      // given
      const userId = 'testGrantEntitlementUid' + Date.now();
      await userService.createUser(userId);

      const entitlementId = 'test_permission';
      const expError = {
        code: 'invalid_entitlement_data',
        message: 'Invalid entitlement uid, no such entitlement found',
        type: 'request',
      };

      // when
      const response = await executeRevokeEntitlementsRequest(AEGIS_URL, PRIVATE_TOKEN_FOR_TESTS, userId, entitlementId);
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(400);
      expect(responseBody.error).toEqual(expError);
    });

    it('revoke entitlement with non-existent id', async () => {
      // given
      const userId = 'testGrantEntitlementUid' + Date.now();
      await userService.createUser(userId);

      const entitlementId = 'Non-existent entitlement id';

      const expError = {
        code: 'invalid_entitlement_data',
        message: 'Invalid entitlement uid, no such entitlement found',
        type: 'request',
      };

      // when
      const response = await executeRevokeEntitlementsRequest(AEGIS_URL, PRIVATE_TOKEN_FOR_TESTS, userId, entitlementId);
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(400);
      expect(responseBody.error).toEqual(expError);
    });

    it('revoke entitlement with wrong token', async () => {
      // given
      const userId = 'testGrantEntitlementUid' + Date.now();
      await userService.createUser(userId);

      const entitlementId = 'test_permission';

      const expError = {
        code: 'control_unauthorized',
        message: 'Authorization error: project not found',
        type: 'request',
      };

      // when
      const response = await executeRevokeEntitlementsRequest(AEGIS_URL, PROJECT_KEY_FOR_TESTS, userId, entitlementId);
      const responseBody = await response.json();

      // then
      expect(response.status).toBe(400);
      expect(responseBody.error).toEqual(expError);
    });
  });
});
