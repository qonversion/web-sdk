import {PaddleStoreData, PurchaseCoreData, StripeStoreData, UserPurchase} from '../../dto/Purchase';

export type PurchasesService = {
  sendStripePurchase: (userId: string, data: PurchaseCoreData & StripeStoreData) => Promise<UserPurchase>;
  sendPaddlePurchase: (userId: string, data: PurchaseCoreData & PaddleStoreData) => Promise<UserPurchase>;
};

export type PurchasesController = {
  sendStripePurchase: (data: PurchaseCoreData & StripeStoreData) => Promise<UserPurchase>;
  sendPaddlePurchase: (data: PurchaseCoreData & PaddleStoreData) => Promise<UserPurchase>;
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
  customer_id: string;
  product_id: string;
  type: 'subscription' | 'inapp';
  subscription_id?: string;
};

export type UserPurchaseApi = PurchaseCoreDataApi & {
  stripe_store_data?: StripeStoreDataApi;
  paddle_store_data?: PaddleStoreDataApi;
};
