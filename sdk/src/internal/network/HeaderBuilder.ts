import {ApiHeader, IHeaderBuilder, RequestHeaders} from './types';
import {EnvironmentProvider, PrimaryConfigProvider} from '../types';
import {DEBUG_MODE_PREFIX, PLATFORM_FOR_API} from './constants';
import {IUserDataProvider} from '../user';

export class HeaderBuilder implements IHeaderBuilder {
  private readonly primaryConfigProvider: PrimaryConfigProvider;
  private readonly environmentProvider: EnvironmentProvider;
  private readonly userDataProvider: IUserDataProvider;

  constructor(primaryConfigProvider: PrimaryConfigProvider, environmentProvider: EnvironmentProvider, userDataProvider: IUserDataProvider) {
    this.primaryConfigProvider = primaryConfigProvider;
    this.environmentProvider = environmentProvider;
    this.userDataProvider = userDataProvider;
  }

  buildCommonHeaders(): RequestHeaders {
    const baseProjectKey = this.primaryConfigProvider.getPrimaryConfig().projectKey;
    const projectKey = this.environmentProvider.isSandbox() ? DEBUG_MODE_PREFIX + baseProjectKey : baseProjectKey;
    const bearer = 'Bearer ' + projectKey;

    return {
      [ApiHeader.Authorization]: bearer,
      //[ApiHeader.Locale]: locale, // todo
      [ApiHeader.Source]: PLATFORM_FOR_API, // todo
      [ApiHeader.SourceVersion]: this.primaryConfigProvider.getPrimaryConfig().sdkVersion, // todo
      [ApiHeader.Platform]: PLATFORM_FOR_API, // todo
      [ApiHeader.PlatformVersion]: this.primaryConfigProvider.getPrimaryConfig().sdkVersion,
      [ApiHeader.UserID]: this.userDataProvider.getUserId() ?? '',
    };
  }
}
