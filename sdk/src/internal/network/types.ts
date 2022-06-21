import {RetryPolicy} from './RetryPolicy';
import {PurchaseCoreData, StripeStoreData} from '../../dto/Purchase';
import {Environment} from '../../dto/Environment';

export enum ApiHeader {
  Accept = "Accept",
  ContentType = "Content-Type",
  Authorization = "Authorization",
  Locale = "User-Locale",
  Source = "Source",
  SourceVersion = "Source-Version",
  Platform = "Platform",
  PlatformVersion = "Platform-Version",
  UserID = "User-Id",
}

export enum ApiEndpoint {
  Users = "v3/users",
  Identity = "v3/identities",
  Properties = "v1/properties",
}

export enum RequestType {
  POST = "POST",
  GET = "GET",
  DELETE = "DELETE",
  PUT = "PUT",
}

export type RequestHeaders = Record<string, string>;
export type RequestBody = Record<string, unknown | null>;

export type NetworkRequest = {
  url: string;
  type: RequestType;
  headers: RequestHeaders;
  body?: RequestBody;
};

export type NetworkResponse = {
  code: number;
};

export type RawNetworkResponse = NetworkResponse & {
  // eslint-disable-next-line
  payload: any;
};

export type NetworkResponseError = NetworkResponse & {
  message: string;
  type?: string;
  apiCode?: string;
  isSuccess: false;
};

export type NetworkResponseSuccess<T> = NetworkResponse & {
  data: T;
  isSuccess: true;
};

export type ApiError = {
  message: string;
  type?: string;
  code?: string;
};

export type NetworkRetryConfig = {
  shouldRetry: boolean;
  attemptIndex: number;
  delay: number;
};

export type NetworkClient = {
  execute: (request: NetworkRequest) => Promise<RawNetworkResponse>;
};

export type ApiInteractor = {
  execute: <T>(request: NetworkRequest, retryPolicy?: RetryPolicy) => Promise<NetworkResponseSuccess<T> | NetworkResponseError>;
};

export type RequestConfigurator = {
  configureUserRequest: (id: string) => NetworkRequest;

  configureCreateUserRequest: (id: string, environment: Environment) => NetworkRequest;

  configureUserPropertiesRequest: (properties: Record<string, string>) => NetworkRequest;

  configureIdentityRequest: (identityId: string) => NetworkRequest;

  configureCreateIdentityRequest: (qonversionId: string, identityId: string) => NetworkRequest;

  configureEntitlementsRequest: (userId: string) => NetworkRequest;

  configureStripePurchaseRequest: (userId: string, data: PurchaseCoreData & StripeStoreData) => NetworkRequest;
};

export type HeaderBuilder = {
  buildCommonHeaders: () => RequestHeaders;
};
