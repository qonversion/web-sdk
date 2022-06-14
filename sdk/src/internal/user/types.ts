export type IUserDataProvider = {
  getUserId: () => string | undefined;

  requireUserId: () => string;
}
