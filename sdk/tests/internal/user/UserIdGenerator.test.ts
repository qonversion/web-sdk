import {UserIdGenerator, UserIdGeneratorImpl} from '../../../src/internal/user';
import {USER_ID_PREFIX, USER_ID_SEPARATOR} from '../../../src/internal/user/constants';

const testUuid = 'b431fcbe-b067-4be0-9288-4a19887522e8';

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
    const uuidWithoutDashes = 'b431fcbeb0674be092884a19887522e8';
    const expRes = `${USER_ID_PREFIX}${USER_ID_SEPARATOR}${uuidWithoutDashes}`;

    // when
    const res = userIdGenerator.generate();

    // then
    expect(res).toBe(expRes);
    expect(uuidGenerator).toBeCalled();
  });
});
