import {UserPropertyKey} from '../../dto/UserPropertyKey';

export const convertDefinedUserPropertyKey = (sourceKey: string): UserPropertyKey => {
  return Object.values(UserPropertyKey).find(userPropertyKey => userPropertyKey == sourceKey) ?? UserPropertyKey.Custom;
};
