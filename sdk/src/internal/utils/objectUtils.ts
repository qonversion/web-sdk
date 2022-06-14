type CamelcaseKeys = <T extends Record<string, any>>(obj: Record<string, any>) => T;
export const camelcaseKeys: CamelcaseKeys = <T> (obj: Record<string, any>) => {
  const keys = Object.keys(obj);
  const result: Record<string, any> = {};
  keys.forEach(key => {
    const value = obj[key];
    const camelcaseKey = snakeToCamelCase(key);
    result[camelcaseKey] = camelcaseValue(value);
  });
  return result as T;
};

const camelcaseValue = (value: any): any => {
  let convertedValue;
  if (value instanceof Array) {
    convertedValue = value.map(arrayValue => camelcaseValue(arrayValue));
  } else if (value instanceof Object) {
    convertedValue = camelcaseKeys(value);
  } else {
    convertedValue = value;
  }
  return convertedValue;
}

export const snakeToCamelCase = (str: string): string =>
  str.replace(/([-_][a-zA-Z])/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );