// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CamelCaseKeys = <T>(value: any) => T;
export const camelCaseKeys: CamelCaseKeys = value => {
  let convertedValue;
  if (Array.isArray(value)) {
    convertedValue = value.map(arrayValue => camelCaseKeys(arrayValue));
  } else if (typeof value === 'object') {
    convertedValue = camelCaseObjectKeys(value);
  } else {
    convertedValue = value;
  }
  return convertedValue;
}

type CamelCaseObjectKeys = <T extends Record<string, unknown>>(obj: Record<string, unknown>) => T;
export const camelCaseObjectKeys: CamelCaseObjectKeys = <T>(obj: Record<string, unknown>) => {
  const keys = Object.keys(obj);
  const result: Record<string, unknown> = {};
  keys.forEach(key => {
    const value = obj[key];
    const camelcaseKey = snakeToCamelCase(key);
    result[camelcaseKey] = camelCaseKeys(value);
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
