import {User} from '../../dto/User';

export type IUserDataProvider = {
  getUserId: () => string | undefined;

  getOriginalUserId: () => string | undefined;

  getIdentityUserId: () => string | undefined;

  requireUserId: () => string;
}

export type UserDataStorage = IUserDataProvider & {
  setOriginalUserId: (originalUserId: string) => void;

  setIdentityUserId: (identityUserId: string) => void;

  clearIdentityUserId: () => void;
};

export type UserIdGenerator = {
  generate: () => string;
};

export type UserService = {
  getUser: (id: string) => Promise<User>
  createUser: (id: string) => Promise<User>
};

export type IdentityService = {
  createIdentity: (qonversionId: string, identityId: string) => Promise<string>;
  obtainIdentity: (identityId: string) => Promise<string>;
};

export type UserController = {
  getUser: () => Promise<User>;
  createUser: () => Promise<User>;
  identify: (identityId: string) => Promise<void>;
  logout: () => Promise<void>;
};

export type UserApi = {
  id: string,
  identity_id: string,
  created: number, // todo check type
  environment: 'prod' | 'sandbox',
};

export type IdentityApi = {
  user_id: string;
};
