import {UserIdGenerator, UserIdGeneratorImpl} from '../../../src/internal/user';
import {USER_ID_PREFIX, USER_ID_SEPARATOR} from '../../../src/internal/user/constants';

const testUuid = 'testUuid';

jest.mock('uuid', () => {
  const originalModule = jest.requireActual('uuid');

  return {
    __esModule: true,
    ...originalModule,
    v4: jest.fn(() => testUuid),
  };
});

import {v4 as uuidGenerator} from 'uuid';

describe('UserIdGenerator tests', function () {
  let userIdGenerator: UserIdGenerator;

  beforeEach(() => {
    userIdGenerator = new UserIdGeneratorImpl();
  });

  test('generate user id', () => {
    // given
    const expRes = `${USER_ID_PREFIX}${USER_ID_SEPARATOR}${testUuid}`;

    // when
    const res = userIdGenerator.generate();

    // then
    expect(res).toBe(expRes);
    expect(uuidGenerator).toBeCalled();
  });
});
