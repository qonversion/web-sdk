import {UserPropertiesStorage} from './types';
import {LocalStorage} from '../common';

export class UserPropertiesStorageImpl implements UserPropertiesStorage {
  private readonly localStorage: LocalStorage;
  private readonly key: string;

  private properties: Record<string, string> = {};

  constructor(localStorage: LocalStorage, key: string) {
    this.localStorage = localStorage;
    this.key = key;

    this.properties = localStorage.getObject(this.key) ?? {};
  }

  add(properties: Record<string, string>): void {
    this.properties = {
      ...this.properties,
      ...properties,
    };
    this.saveProperties();
  }

  addOne(key: string, value: string): void {
    this.properties[key] = value;
    this.saveProperties();
  }

  delete(properties: Record<string, string>): void {
    Object.keys(properties).forEach(key => {
      if (this.properties[key] == properties[key]) {
        delete this.properties[key];
      }
    });

    this.saveProperties();
  }

  deleteOne(key: string, value: string): void {
    if (this.properties[key] == value) {
      delete this.properties[key];
      this.saveProperties();
    }
  }

  clear(): void {
    this.properties = {};
    this.saveProperties();
  }

  getProperties(): Record<string, string> {
    return this.properties;
  }

  private saveProperties() {
    this.localStorage.putObject(this.key, this.properties);
  }
}
