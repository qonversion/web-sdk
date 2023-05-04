export type User = {
  id: string,
  identityId?: string | null,
  created: number,
  environment: 'prod' | 'sandbox',
};
