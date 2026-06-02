import {
  PaddleStoreData,
  PurchaseCoreData,
  StripeStoreData,
  UserPaddlePurchase,
  UserStripePurchase,
} from '../../dto/Purchase';

export type PurchasesService = {
  sendStripePurchase: (userId: string, data: PurchaseCoreData & StripeStoreData) => Promise<UserStripePurchase>;
  sendPaddlePurchase: (userId: string, data: PurchaseCoreData & PaddleStoreData) => Promise<UserPaddlePurchase>;
};

export type PurchasesController = {
  sendStripePurchase: (data: PurchaseCoreData & StripeStoreData) => Promise<UserStripePurchase>;
  sendPaddlePurchase: (data: PurchaseCoreData & PaddleStoreData) => Promise<UserPaddlePurchase>;
};

export type PurchaseCoreDataApi = {
  price: string;
  currency: string;
  purchased: number;
  userId: string;
};

export type StripeStoreDataApi = {
  subscription_id: string;
  product_id: string;
};

export type PaddleStoreDataApi = {
  transaction_id: string;
  product_id: string;
  // Wire enum: the server's shared UserPurchaseProductType uses "non_recurring"
  // for one-time purchases. The SDK surfaces it as "inapp"; conversion is
  // handled in RequestConfigurator (write) and PurchaseService (read).
  type: 'subscription' | 'non_recurring';
  subscription_id?: string;
};

export type UserPurchaseApi = PurchaseCoreDataApi & {
  stripe_store_data?: StripeStoreDataApi;
  paddle_store_data?: PaddleStoreDataApi;
};
