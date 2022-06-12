export type IUserDataProvider = {
  getUserId: () => string | undefined;

  requireUserId: () => string;
}

export type UserDataStorage = IUserDataProvider & {
  setOriginalUserId: (originalUserId: string) => void;

  setIdentityUserId: (identityUserId: string) => void;

  clearIdentityUserId: () => void;
};
