import {LocalStorage} from './types';

export class LocalStorageImpl implements LocalStorage {
  getInt(key: string): number | undefined {
    const stringValue = this.getString(key);
    if (stringValue) {
      return Number.parseInt(stringValue);
    }
    return undefined;
  }

  getFloat(key: string): number | undefined {
    const stringValue = this.getString(key);
    if (stringValue) {
      return Number.parseFloat(stringValue);
    }
    return undefined;
  }

  getString(key: string): string | undefined {
    return localStorage.getItem(key) ?? undefined;
  }

  getObject<T extends Record<string, unknown>>(key: string): T | undefined {
    const stringValue = this.getString(key);
    if (stringValue) {
      try {
        return JSON.parse(stringValue);
      } catch (e) {
        // do nothing.
      }
    }
    return undefined;
  }

  putObject(key: string, value: Record<string, unknown>) {
    try {
      const stringValue = JSON.stringify(value);
      this.putString(key, stringValue);
    } catch (e) {
      // do nothing.
    }
  }

  putNumber(key: string, value: number) {
    this.putString(key, value.toString());
  }

  putString(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }
}
