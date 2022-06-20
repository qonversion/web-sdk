type CamelcaseKeys = <T>(value: any) => T;
export const camelcaseKeys: CamelcaseKeys = <T>(value: any) => {
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

type CamelcaseObjectKeys = <T extends Record<string, any>>(obj: Record<string, any>) => T;
export const camelcaseObjectKeys: CamelcaseObjectKeys = <T>(obj: Record<string, any>) => {
  const keys = Object.keys(obj);
  const result: Record<string, any> = {};
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