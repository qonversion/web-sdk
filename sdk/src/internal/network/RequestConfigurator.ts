import {ApiEndpoint, IHeaderBuilder, IRequestConfigurator, NetworkRequest, RequestType} from './types';
import {PrimaryConfigProvider} from '../types';
import {IUserDataProvider} from '../user';

export class RequestConfigurator implements IRequestConfigurator {
  private readonly headerBuilder: IHeaderBuilder;
  private readonly baseUrl: string;

  constructor(headerBuilder: IHeaderBuilder, baseUrl: string) {
    this.headerBuilder = headerBuilder;
    this.baseUrl = baseUrl;
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
