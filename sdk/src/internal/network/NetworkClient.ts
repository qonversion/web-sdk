import {ApiHeader, NetworkClient, NetworkRequest, RawNetworkResponse} from './types';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

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
    const data = await this.parseResponseBody(response, code);
    return {code, payload: data};
  }

  private async parseResponseBody(response: Response, code: number): Promise<unknown> {
    const responseText = await response.text();
    if (!responseText) {
      return undefined;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!NetworkClientImpl.isJsonContentType(contentType)) {
      return responseText;
    }

    try {
      return JSON.parse(responseText);
    } catch (cause) {
      throw new QonversionError(
        QonversionErrorCode.BackendError,
        `Response code ${code}, message: Failed to parse JSON response`,
        cause instanceof Error ? cause : undefined,
      );
    }
  }

  private static isJsonContentType(contentType: string): boolean {
    const normalizedContentType = contentType.toLowerCase();
    return normalizedContentType.includes('application/json') || normalizedContentType.includes('+json');
  }
}
