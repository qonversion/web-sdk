export type PurchaseCoreData = {
  price: string;
  currency: string; // Currency code by ISO 4217 standard
  purchased?: number;
};

export type StripeStoreData = {
  subscriptionId: string;
  productId: string;
};

export type UserPurchase = PurchaseCoreData & {
  purchased: number;
  stripeStoreData: StripeStoreData;
  userId: string;
};
