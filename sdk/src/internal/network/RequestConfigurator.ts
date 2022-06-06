import {ApiEndpoint, IHeaderBuilder, IRequestConfigurator, NetworkRequest, RequestType} from './types';
import {PrimaryConfigProvider} from '../types';
import {IUserDataProvider} from '../user';

export class RequestConfigurator implements IRequestConfigurator {
  private readonly headerBuilder: IHeaderBuilder;
  private readonly baseUrl: string;
  private readonly primaryConfigProvider: PrimaryConfigProvider;
  private readonly userDataProvider: IUserDataProvider;

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
    const url = this.baseUrl + '/' + ApiEndpoint.Users + '/' + id;

    return {
      url,
      headers,
      type: RequestType.GET,
    };
  }
}
