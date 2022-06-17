import {ApiEndpoint, HeaderBuilder, RequestConfigurator, NetworkRequest, RequestType} from './types';
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
    const headers = this.headerBuilder.buildCommonHeaders();
    const url = `${this.baseUrl}/${ApiEndpoint.Users}/${id}`;

    return {
      url,
      headers,
      type: RequestType.GET,
    };
  }

  configureCreateUserRequest(id: string, environment: Environment): NetworkRequest {
    const headers = this.headerBuilder.buildCommonHeaders();
    const url = `${this.baseUrl}/${ApiEndpoint.Users}/${id}`;
    const body = {environment};

    return {
      url,
      body,
      headers,
      type: RequestType.POST,
    };
  }

  configureUserPropertiesRequest(properties: Record<string, string>): NetworkRequest {
    const headers = this.headerBuilder.buildCommonHeaders();
    const url = `${this.baseUrl}/${ApiEndpoint.Properties}`;
    // TODO delete access_token and q_uid from the body after migrating API to v2
    const body = {
      "access_token": this.primaryConfigProvider.getPrimaryConfig().projectKey,
      "q_uid": this.userDataProvider.getOriginalUserId(),
      "properties": properties
    };

    return {
      url,
      headers,
      type: RequestType.POST,
      body,
    };
  }

  configureCreateIdentityRequest(qonversionId: string, identityId: string): NetworkRequest {
    const headers = this.headerBuilder.buildCommonHeaders();
    const url = `${this.baseUrl}/${ApiEndpoint.Identity}/${identityId}`;
    const body = {user_id: qonversionId};

    return {
      url,
      headers,
      type: RequestType.POST,
      body,
    };
  }

  configureIdentityRequest(identityId: string): NetworkRequest {
    const headers = this.headerBuilder.buildCommonHeaders();
    const url = `${this.baseUrl}/${ApiEndpoint.Identity}/${identityId}`;

    return {
      url,
      headers,
      type: RequestType.GET,
    };
  }

  configureEntitlementsRequest(userId: string): NetworkRequest {
    const headers = this.headerBuilder.buildCommonHeaders();
    const url = `${this.baseUrl}/${ApiEndpoint.Users}/${userId}/entitlements`;

    return {
      url,
      headers,
      type: RequestType.GET,
    };
  }

  configureStripePurchaseRequest(userId: string, data: PurchaseCoreData & StripeStoreData): NetworkRequest {
    const headers = this.headerBuilder.buildCommonHeaders();
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

    return {
      url,
      headers,
      type: RequestType.POST,
      body,
    };
  }
}
