import {ApiHeader, NetworkClient, NetworkRequest, RawNetworkResponse} from './types';

export class NetworkClientImpl implements NetworkClient {
  async execute(request: NetworkRequest): Promise<RawNetworkResponse> {
    const headers: HeadersInit = {
      ...request.headers,
      [ApiHeader.ContentType]: 'application/json',
      [ApiHeader.Accept]: 'application/json',
    };
    const body: BodyInit | undefined = request.body ? JSON.stringify(request.body) : undefined;
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
