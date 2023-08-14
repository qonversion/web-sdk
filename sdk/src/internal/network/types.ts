import {RetryPolicy} from './RetryPolicy';
import {PurchaseCoreData, StripeStoreData} from '../../dto/Purchase';
import {Environment} from '../../dto/Environment';
import {UserPropertyData} from '../userProperties';

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
  Properties = "properties",
}

export enum RequestType {
  POST = "POST",
  GET = "GET",
  DELETE = "DELETE",
  PUT = "PUT",
}

export type RequestHeaders = Record<string, string>;
export type RequestBody = Record<string, unknown | null> | Array<unknown>;

export type NetworkRequest = {
  url: string;
  type: RequestType;
  headers: RequestHeaders;
  body?: RequestBody;
};

export type NetworkResponseBase = {
  code: number;
};

export type RawNetworkResponse = NetworkResponseBase & {
  // eslint-disable-next-line
  payload: any;
};

export type ApiResponseError = NetworkResponseBase & {
  message: string;
  type?: string;
  apiCode?: string;
  isSuccess: false;
};

export type ApiResponseSuccess<T> = NetworkResponseBase & {
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
  execute: <T>(request: NetworkRequest, retryPolicy?: RetryPolicy) => Promise<ApiResponseSuccess<T> | ApiResponseError>;
};

export type RequestConfigurator = {
  configureUserRequest: (id: string) => NetworkRequest;

  configureCreateUserRequest: (id: string, environment: Environment) => NetworkRequest;

  configureUserPropertiesSendRequest: (userId: string, properties: UserPropertyData[]) => NetworkRequest;

  configureUserPropertiesGetRequest: (userId: string) => NetworkRequest;

  configureIdentityRequest: (identityId: string) => NetworkRequest;

  configureCreateIdentityRequest: (qonversionId: string, identityId: string) => NetworkRequest;

  configureEntitlementsRequest: (userId: string) => NetworkRequest;

  configureStripePurchaseRequest: (userId: string, data: PurchaseCoreData & StripeStoreData) => NetworkRequest;
};

export type HeaderBuilder = {
  buildCommonHeaders: () => RequestHeaders;
};
