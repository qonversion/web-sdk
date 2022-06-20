export type User = {
  id: string,
  identityId: string,
  created: number, // todo check type
  environment: 'prod' | 'sandbox',
};
