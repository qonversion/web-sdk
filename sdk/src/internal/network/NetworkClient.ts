import {ApiHeader, INetworkClient, NetworkRequest, RawNetworkResponse} from './types';

export class NetworkClient implements INetworkClient {
  async execute(request: NetworkRequest): Promise<RawNetworkResponse> {
    const headers = {
      ...request.headers,
      [ApiHeader.ContentType]: 'application/json',
      [ApiHeader.Accept]: 'application/json',
    };
    const body = request.body ? JSON.stringify(request.body) : undefined;
    const requestInit: RequestInit = {
      method: request.type,
      headers,
      body,
    };

    const response = await fetch(request.url, requestInit);
    const code = response.status;
    const data = await response.json();
    return {code, payload: data};
  }
}
