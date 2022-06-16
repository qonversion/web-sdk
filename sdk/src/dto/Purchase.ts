export type PurchaseCoreData = {
  price: number;
  currency: string; // Currency code by ISO 4217 standard
  purchased: number; // todo check date type
};

export type StripeStoreData = {
  subscriptionId: string;
  productId: string;
};

export type UserPurchase = PurchaseCoreData & {
  stripeStoreData: StripeStoreData;
};
