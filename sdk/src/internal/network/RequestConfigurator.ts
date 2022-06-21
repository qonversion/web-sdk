import {ApiEndpoint, IHeaderBuilder, IRequestConfigurator, NetworkRequest, RequestType} from './types';
import {PrimaryConfigProvider} from '../types';
import {IUserDataProvider} from '../user';
import {PurchaseCoreData, StripeStoreData} from '../../dto/Purchase';

export class RequestConfigurator implements IRequestConfigurator {
  private readonly headerBuilder: IHeaderBuilder;
  private readonly baseUrl: string;
  private readonly primaryConfigProvider: PrimaryConfigProvider;
  private readonly userDataProvider: IUserDataProvider

  constructor(
    headerBuilder: IHeaderBuilder,
    baseUrl: string,
    primaryConfigProvider: PrimaryConfigProvider,
    userDataProvider: IUserDataProvider
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

  configureCreateUserRequest(id: string): NetworkRequest {
    const headers = this.headerBuilder.buildCommonHeaders();
    const url = `${this.baseUrl}/${ApiEndpoint.Users}`;
    const body = {id};

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
      "q_uid": this.userDataProvider.getUserId(),
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
