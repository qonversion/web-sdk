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

export type UserStripePurchase = PurchaseCoreData & {
  purchased: number;
  userId: string;
  stripeStoreData: StripeStoreData;
};

export type UserPaddlePurchase = PurchaseCoreData & {
  purchased: number;
  userId: string;
  paddleStoreData: PaddleStoreData;
};

// Discriminated union — a UserPurchase carries exactly one store's data.
// Functions that produce a purchase (sendStripePurchase / sendPaddlePurchase)
// return the narrow type, so consumers that use the return value directly
// keep the same non-nullable store-data field they had before Paddle support.
export type UserPurchase = UserStripePurchase | UserPaddlePurchase;
