import {camelCaseObjectKeys, snakeToCamelCase} from '../../../internal/utils/objectUtils';

describe('snakeToCamelCase tests', function () {
  test('simple case', () => {
    // given
    const testCases = {
      snake_case_string: 'snakeCaseString',
      snake: 'snake',
      snake_CASE_string: 'snakeCASEString',
      SNAKE_CASE_STRING: 'SNAKECASESTRING',
      snake_number_1: 'snakeNumber_1'
    };

    Object.keys(testCases).forEach(givenStr => {
      const expStr = testCases[givenStr];

      // when
      const res = snakeToCamelCase(givenStr);

      // then
      expect(res).toBe(expStr);
    });
  });
});

describe('camelcaseKeys tests', () => {
  test('', () => {
    // given
    const testCases = [
      [{
        key_1: 'a',
        aaa: 'aaa',
        be_be_be: 'beBeBe'
      }, {
        key_1: 'a',
        aaa: 'aaa',
        beBeBe: 'beBeBe'
      }],

      [{
        key_1: ['a', 'b', {aa_bb_cc: 'aaBbCc'}],
        aaa: 'aaa',
        be_be_be: {
          sub_object: 1,
          sub_object2: [[{test_key: undefined}]],
        }
      }, {
        key_1: ['a', 'b', {aaBbCc: 'aaBbCc'}],
        aaa: 'aaa',
        beBeBe: {
          subObject: 1,
          subObject2: [[{testKey: undefined}]],
        }
      }],
    ];

    testCases.forEach(testCase => {
      // when
      const res = camelCaseObjectKeys(testCase[0]);

      // then
      expect(res).toStrictEqual(testCase[1]);
    });
  });
});
