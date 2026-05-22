export type PurchaseCoreData = {
  price: string;
  currency: string; // Currency code by ISO 4217 standard
  purchased?: number;
};

export type StripeStoreData = {
  subscriptionId: string;
  productId: string;
};

export type PaddlePurchaseType = 'subscription' | 'inapp';

export type PaddleStoreData = {
  transactionId: string;
  customerId: string;
  productId: string;
  type: PaddlePurchaseType;
  // Required when type is "subscription"; omitted for "inapp" purchases.
  subscriptionId?: string;
};

export type UserPurchase = PurchaseCoreData & {
  purchased: number;
  userId: string;
  stripeStoreData?: StripeStoreData;
  paddleStoreData?: PaddleStoreData;
};
