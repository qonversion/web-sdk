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
    const data = await NetworkClientImpl.parseResponseBody(response, code);
    return {code, payload: data};
  }

  /**
   * Every API response the SDK consumes is a JSON document, whatever the status code.
   * Anything else (an empty body, an HTML page from a proxy or a captive portal,
   * a truncated document) is not an API response: it is reported as a backend error
   * carrying the HTTP status, never interpreted by status code or returned as data.
   * The body itself is not copied into the error message.
   */
  private static async parseResponseBody(response: Response, code: number): Promise<unknown> {
    const responseText = (await response.text()).trim();
    if (!responseText) {
      throw new QonversionError(QonversionErrorCode.BackendError, 'Empty response body', undefined, code);
    }

    try {
      return JSON.parse(responseText);
    } catch {
      // The parser's own message quotes the start of the body, so it is not attached as cause.
      throw new QonversionError(QonversionErrorCode.BackendError, 'Failed to parse JSON response', undefined, code);
    }
  }
}
