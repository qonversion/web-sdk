import {UserPropertyKey} from './UserPropertyKey';
import {convertDefinedUserPropertyKey} from '../internal/utils/propertyUtils';

export class UserProperty {
  key: string;
  value: string;

  /**
   * {@link UserPropertyKey} used to set this property.
   * Returns {@link UserPropertyKey.Custom} for custom properties.
   */
  definedKey: UserPropertyKey;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
    this.definedKey = convertDefinedUserPropertyKey(key);
  }
}
