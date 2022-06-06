import {RetryPolicy} from './RetryPolicy';

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
  Users = "users",
  Properties = "properties",
}

export enum RequestType {
  POST = "POST",
  GET = "GET",
  DELETE = "DELETE",
  PUT = "PUT",
}

export type RequestHeaders = Record<string, string>;

export type NetworkRequest = {
  url: string;
  type: RequestType;
  headers: RequestHeaders;
  body?: Record<string, any | null>;
};

export type NetworkResponse = {
  code: number;
};

export type RawNetworkResponse = NetworkResponse & {
  payload: any;
};

export type NetworkResponseError = NetworkResponse & {
  message: string;
  type?: string;
  apiCode?: string;
};

export type NetworkResponseSuccess = NetworkResponse & {
  data: any;
};

export type INetworkClient = {
  execute: (request: NetworkRequest) => Promise<RawNetworkResponse>;
};

export type IApiInteractor = {
  execute: (request: NetworkRequest, retryPolicy?: RetryPolicy) => Promise<NetworkResponseSuccess | NetworkResponseError>;
};

export type IRequestConfigurator = {
  configureUserRequest: (id: string) => NetworkRequest;
};

export type IHeaderBuilder = {
  buildCommonHeaders: () => RequestHeaders;
};
