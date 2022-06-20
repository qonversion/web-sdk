import {UserIdGenerator} from './types';
import {v4 as generateUuid} from 'uuid';
import {USER_ID_PREFIX, USER_ID_SEPARATOR} from './constants';

export class UserIdGeneratorImpl implements UserIdGenerator {
  generate(): string {
    const uuid = generateUuid().replace('-', '');

    return `${USER_ID_PREFIX}${USER_ID_SEPARATOR}${uuid}`;
  }
}
