export type Entitlement = {
   id: string;
   active: boolean;
   started: number;
   expires: number;
   source: EntitlementSource;
   product?: Product;
}

export type Product = {
   productId: string;
   subscription?: Subscription;
};

export type Subscription = {
   renewState: RenewState;
   currentPeriodType: PeriodType;
};

export enum RenewState {
   WillRenew = 'will_renew',
   Canceled = 'canceled',
   BillingIssue = 'billing_issue',
}

export enum PeriodType {
   Normal = 'normal',
   Trial = 'trial',
   Intro = 'intro',
}

export enum EntitlementSource {
   Unknown = 'unknown',
   AppStore = 'appStore',
   PlayStore = 'playStore',
   Stripe = 'stripe',
   Manual = 'manual'
}