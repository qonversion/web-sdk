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
import {PurchaseCoreData, StripeStoreData} from '../../dto/Purchase';
import {Environment} from '../../dto/Environment';

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

  configureUserPropertiesRequest(properties: Record<string, string>): NetworkRequest {
    const url = `${this.baseUrl}/${ApiEndpoint.Properties}`;
    // TODO delete access_token and q_uid from the body after migrating API to v2
    const body = {
      "access_token": this.primaryConfigProvider.getPrimaryConfig().projectKey,
      "q_uid": this.userDataProvider.getOriginalUserId(),
      "properties": properties
    };

    return this.configureRequest(url, RequestType.POST, body);
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
