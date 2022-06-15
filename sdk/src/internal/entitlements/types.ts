import {Entitlement, PeriodType, RenewState} from '../../dto/Entitlement';

export type EntitlementsService = {
  getEntitlements: (userId: string) => Promise<Entitlement[]>;
};

export type EntitlementsController = {
  getEntitlements: () => Promise<Entitlement[]>;
};

export type EntitlementsResponse = {
  object: 'list';
  data: EntitlementApi[];
};

export type EntitlementApi = {
  id: string;
  active: boolean;
  started: number; // todo check data type
  expires: number; // todo check data type
  product?: ProductApi;
}

export type ProductApi = {
  product_id: string;
  subscription?: SubscriptionApi;
};

export type SubscriptionApi = {
  renew_state: RenewState;
  current_period_type: PeriodType;
};
