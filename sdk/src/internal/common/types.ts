export type LocalStorage = {
  getInt(key: string): number | undefined;
  getFloat(key: string): number | undefined;
  putNumber(key: string, value: number): void;
  getString(key: string): string | undefined;
  putString(key: string, value: string): void;
  putObject(key: string, value: Record<string, unknown>): void;
  getObject<T extends Record<string, unknown>>(key: string): T | undefined;
  remove(key: string): void;
};
