import {
  ApiEndpoint,
  HeaderBuilder,
  NetworkRequest,
  RequestBody,
  RequestConfigurator,
  RequestHeaders,
  RequestType
} from './types';
import {PrimaryConfigProvider} from '../types';
import {UserDataProvider} from '../user';
import {PaddleStoreData, PurchaseCoreData, StripeStoreData} from '../../dto/Purchase';
import {Environment} from '../../dto/Environment';
import {UserPropertyData} from '../userProperties';

export class RequestConfiguratorImpl implements RequestConfigurator {
  private readonly headerBuilder: HeaderBuilder;
  private readonly baseUrl: string;
  private readonly primaryConfigProvider: PrimaryConfigProvider;
  private readonly userDataProvider: UserDataProvider

  constructor(
    headerBuilder: HeaderBuilder,
    baseUrl: string,
    primaryConfigProvider: PrimaryConfigProvider,
    userDataProvider: UserDataProvider
  ) {
    this.headerBuilder = headerBuilder;
    this.baseUrl = baseUrl;
    this.primaryConfigProvider = primaryConfigProvider;
    this.userDataProvider = userDataProvider;
  }

  configureUserRequest(id: string): NetworkRequest {
    const url = `${this.baseUrl}/${ApiEndpoint.Users}/${id}`;

    return this.configureRequest(url, RequestType.GET);
  }

  configureCreateUserRequest(id: string, environment: Environment): NetworkRequest {
    const url = `${this.baseUrl}/${ApiEndpoint.Users}/${id}`;
    const body = {environment};

    return this.configureRequest(url, RequestType.POST, body);
  }

  configureUserPropertiesSendRequest(userId: string, properties: UserPropertyData[]): NetworkRequest {
    const url = `${this.baseUrl}/${ApiEndpoint.Users}/${userId}/${ApiEndpoint.Properties}`;
    return this.configureRequest(url, RequestType.POST, properties);
  }

  configureUserPropertiesGetRequest(userId: string): NetworkRequest {
    const url = `${this.baseUrl}/${ApiEndpoint.Users}/${userId}/${ApiEndpoint.Properties}`;
    return this.configureRequest(url, RequestType.GET);
  }

  configureCreateIdentityRequest(qonversionId: string, identityId: string): NetworkRequest {
    const url = `${this.baseUrl}/${ApiEndpoint.Identity}/${identityId}`;
    const body = {user_id: qonversionId};

    return this.configureRequest(url, RequestType.POST, body);
  }

  configureIdentityRequest(identityId: string): NetworkRequest {
    const url = `${this.baseUrl}/${ApiEndpoint.Identity}/${identityId}`;

    return this.configureRequest(url, RequestType.GET);
  }

  configureEntitlementsRequest(userId: string): NetworkRequest {
    const url = `${this.baseUrl}/${ApiEndpoint.Users}/${userId}/entitlements`;

    return this.configureRequest(url, RequestType.GET);
  }

  configureStripePurchaseRequest(userId: string, data: PurchaseCoreData & StripeStoreData): NetworkRequest {
    const url = `${this.baseUrl}/${ApiEndpoint.Users}/${userId}/purchases`;
    const body = {
      price: data.price,
      currency: data.currency,
      stripe_store_data: {
        subscription_id: data.subscriptionId,
        product_id: data.productId,
      },
      purchased: data.purchased,
    };

    return this.configureRequest(url, RequestType.POST, body);
  }

  configurePaddlePurchaseRequest(userId: string, data: PurchaseCoreData & PaddleStoreData): NetworkRequest {
    const url = `${this.baseUrl}/${ApiEndpoint.Users}/${userId}/purchases`;
    const paddleStoreData: RequestBody = {
      transaction_id: data.transactionId,
      customer_id: data.customerId,
      product_id: data.productId,
      type: data.type,
    };
    // Paddle one-time purchases (`type: 'inapp'`) have no subscription id; omit
    // the field entirely instead of sending an empty string so the api-gateway
    // PaddleStoreData parser doesn't reject it.
    if (data.subscriptionId !== undefined) {
      paddleStoreData.subscription_id = data.subscriptionId;
    }
    const body = {
      price: data.price,
      currency: data.currency,
      paddle_store_data: paddleStoreData,
      purchased: data.purchased,
    };

    return this.configureRequest(url, RequestType.POST, body);
  }

  private configureRequest(
    url: string,
    type: RequestType,
    body?: RequestBody,
    additionalHeaders?: RequestHeaders
  ): NetworkRequest {
    let headers = this.headerBuilder.buildCommonHeaders();
    if (additionalHeaders) {
      headers = {...headers, ...additionalHeaders};
    }

    return {
      url,
      headers,
      type,
      body,
    }
  }
}
