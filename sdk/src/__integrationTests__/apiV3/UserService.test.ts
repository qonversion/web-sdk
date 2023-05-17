import {User} from '../../dto/User';
import {Environment} from '../../dto/Environment';
import {expectQonversionErrorAsync, getCurrentTs, getDependencyAssembly} from '../utils';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';
import {TS_EPSILON} from '../constants';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// noinspection JSConstantReassignment
global.localStorage = {
  getItem: jest.fn(),
};

describe('users tests', function () {
  const dependenciesAssembly = getDependencyAssembly();

  const userService = dependenciesAssembly.userService();

  describe('POST users', function () {
    it('create production user', async () => {
      // given
      const testsStartTs = getCurrentTs();
      const testUserId = 'testProd' + testsStartTs;
      const expectedUser: User = {
        created: 0,
        environment: Environment.Production,
        id: testUserId,
        identityId: undefined,
      };

      // when
      const res = await userService.createUser(testUserId);
      const requestEndTs = getCurrentTs();

      // then
      expect(res.created).toBeGreaterThanOrEqual(testsStartTs - TS_EPSILON);
      expect(res.created).toBeLessThanOrEqual(requestEndTs + TS_EPSILON);
      expectedUser.created = res.created;
      expect(res).toEqual(expectedUser);
    });

    it('create existing user', async () => {
      // given
      const testsStartTs = getCurrentTs();
      const testUserId = 'testExistingUser' + testsStartTs;
      await userService.createUser(testUserId);

      // when and then
      await expectQonversionErrorAsync(
        QonversionErrorCode.BackendError,
        'Qonversion API returned an error. Response code 422, message: User with given uid already exists',
        async () => {
          await userService.createUser(testUserId);
        },
      );
    });

    it('create sandbox user', async () => {
      // given
      const dependenciesAssembly = getDependencyAssembly({environment: Environment.Sandbox});

      const userService = dependenciesAssembly.userService();

      const testsStartTs = getCurrentTs();

      const testUserId = 'testSandbox' + testsStartTs;
      const expectedUser: User = {
        created: 0,
        environment: Environment.Sandbox,
        id: testUserId,
        identityId: undefined,
      };

      // when
      const res = await userService.createUser(testUserId);
      const requestEndTs = getCurrentTs();

      // then
      expect(res.created).toBeGreaterThanOrEqual(testsStartTs - TS_EPSILON);
      expect(res.created).toBeLessThanOrEqual(requestEndTs + TS_EPSILON);
      expectedUser.created = res.created;
      expect(res).toEqual(expectedUser);
    });
  });

  describe('GET users', function () {
    it('get existing user', async () => {
      // given
      const testUserId = 'testGet' + Date.now();
      const expUser = await userService.createUser(testUserId);

      // when
      const res = await userService.getUser(testUserId);

      // then
      expect(res).toEqual(expUser);
    });

    it('get non-existent user', async () => {
      // given
      const nonExistentUserId = 'testNonExistent' + Date.now();

      // when and then
      await expectQonversionErrorAsync(
        QonversionErrorCode.UserNotFound,
        'Qonversion user not found. Id: ' + nonExistentUserId,
        async () => {
          await userService.getUser(nonExistentUserId);
        },
      );
    });
  });
});
