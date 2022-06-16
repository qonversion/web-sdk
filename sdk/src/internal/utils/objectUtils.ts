// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CamelcaseKeys = <T>(value: any) => T;
export const camelcaseKeys: CamelcaseKeys = value => {
  let convertedValue;
  if (value instanceof Array) {
    convertedValue = value.map(arrayValue => camelcaseKeys(arrayValue));
  } else if (value instanceof Object) {
    convertedValue = camelcaseObjectKeys(value);
  } else {
    convertedValue = value;
  }
  return convertedValue;
}

type CamelcaseObjectKeys = <T extends Record<string, unknown>>(obj: Record<string, unknown>) => T;
export const camelcaseObjectKeys: CamelcaseObjectKeys = <T>(obj: Record<string, unknown>) => {
  const keys = Object.keys(obj);
  const result: Record<string, unknown> = {};
  keys.forEach(key => {
    const value = obj[key];
    const camelcaseKey = snakeToCamelCase(key);
    result[camelcaseKey] = camelcaseKeys(value);
  });
  return result as T;
};

type SnakeToCamelCaseConverter = (str: string) => string;
export const snakeToCamelCase: SnakeToCamelCaseConverter = str =>
  str.replace(/([-_][a-zA-Z])/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );