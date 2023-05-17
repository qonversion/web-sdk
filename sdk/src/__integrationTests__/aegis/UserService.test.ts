import {User} from '../../dto/User';
import {Environment} from '../../dto/Environment';
import {getDependencyAssembly} from '../utils';
import {AEGIS_URL} from '../constants';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// noinspection JSConstantReassignment
global.localStorage = {
  getItem: jest.fn(),
};

describe('users tests', function () {
  const dependenciesAssembly = getDependencyAssembly({apiUrl: AEGIS_URL});

  const userService = dependenciesAssembly.userService();

  describe('POST users', function () {
    it('create production user', async () => {
      // given
      const testUserId = 'testProd' + Date.now();
      const expectedUser: User = {
        created: 0,
        environment: Environment.Production,
        id: testUserId,
        identityId: undefined,
      };

      // when
      const res = await userService.createUser(testUserId);

      // then
      expect(res).toEqual(expectedUser);
    });

    it('create existing user', async () => {
      // given
      const testUserId = 'testExistingUser' + Date.now();
      await userService.createUser(testUserId);
      const expectedUser: User = {
        created: 0,
        environment: Environment.Production,
        id: testUserId,
        identityId: undefined,
      };

      // when
      const res = await userService.createUser(testUserId);

      // then
      expect(res).toEqual(expectedUser);
    });

    it('create sandbox user', async () => {
      // given
      const dependenciesAssembly = getDependencyAssembly({
        environment: Environment.Sandbox,
        apiUrl: AEGIS_URL,
      });

      const userService = dependenciesAssembly.userService();

      const testUserId = 'testSandbox' + Date.now();
      const expectedUser: User = {
        created: 0,
        environment: Environment.Sandbox,
        id: testUserId,
        identityId: undefined,
      };

      // when
      const res = await userService.createUser(testUserId);

      // then
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
      const expectedUser: User = {
        created: 0,
        environment: Environment.Production,
        id: nonExistentUserId,
        identityId: undefined,
      };

      // when
      const res = await userService.getUser(nonExistentUserId);

      // then
      expect(res).toEqual(expectedUser);
    });
  });
});
