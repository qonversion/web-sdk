import {
  ApiHeader,
  NetworkClientImpl,
  NetworkRequest,
  RawNetworkResponse,
  RequestHeaders,
  RequestType
} from '../../../internal/network';
import {QonversionError, QonversionErrorCode} from '../../../index';

const networkClient = new NetworkClientImpl();

const testUrl = 'test url';
const testHeaders = {a: 'a', b: 'b'};
const testBody = {c: 'c', d: 'd'};
const testCode = 212;
const testPayload = {data: {someField: 'value'}};

describe('execute test', () => {
  const expResult: RawNetworkResponse = {
    code: testCode,
    payload: testPayload,
  };

  const expHeaders: RequestHeaders = {
    ...testHeaders,
    [ApiHeader.ContentType]: 'application/json',
    [ApiHeader.Accept]: 'application/json',
  };

  // @ts-ignore
  const mockFetch = jest.fn(() =>
    Promise.resolve({
      status: testCode,
      headers: {
        get: (header: string) => header === 'content-type' ? 'application/json' : null,
      },
      text: () => Promise.resolve(JSON.stringify(testPayload)),
    })
  );

  const savedFetch = global.fetch;

  beforeAll(() => {
    Object.defineProperty(global, 'fetch', {
      writable: true,
    });
    // @ts-ignore
    global.fetch = mockFetch;
  });

  afterAll(() => {
    global.fetch = savedFetch;
  });

  beforeEach(() => {
    mockFetch.mockClear();
  });

  test('usual execute', async () => {
    // given
    const request: NetworkRequest = {
      body: testBody,
      headers: testHeaders,
      type: RequestType.PUT,
      url: testUrl
    };

    const expRequest: RequestInit = {
      method: request.type,
      headers: expHeaders,
      body: JSON.stringify(testBody),
    };

    // when
    const result = await networkClient.execute(request);

    // then
    expect(result).toStrictEqual(expResult);
    expect(fetch).toBeCalledWith(testUrl, expRequest);
  });

  test('execute without body', async () => {
    // given
    const request: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.GET,
      url: testUrl
    };

    const expRequest: RequestInit = {
      method: request.type,
      headers: expHeaders,
    };

    // when
    const result = await networkClient.execute(request);

    // then
    expect(result).toStrictEqual(expResult);
    expect(fetch).toBeCalledWith(testUrl, expRequest);
  });

  test('execute with empty response body', async () => {
    // given
    const request: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.GET,
      url: testUrl
    };
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        status: 204,
        headers: {
          get: () => null,
        },
        text: () => Promise.resolve(''),
      })
    );

    // when
    const result = await networkClient.execute(request);

    // then
    expect(result).toStrictEqual({
      code: 204,
      payload: undefined,
    });
  });

  test('execute with plain text response body', async () => {
    // given
    const request: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.GET,
      url: testUrl
    };
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        status: 503,
        headers: {
          get: (header: string) => header === 'content-type' ? 'text/plain' : null,
        },
        text: () => Promise.resolve('service unavailable'),
      })
    );

    // when
    const result = await networkClient.execute(request);

    // then
    expect(result).toStrictEqual({
      code: 503,
      payload: 'service unavailable',
    });
  });

  test('execute with malformed json body', async () => {
    // given
    const request: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.GET,
      url: testUrl
    };
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        status: 500,
        headers: {
          get: (header: string) => header === 'content-type' ? 'application/json' : null,
        },
        text: () => Promise.resolve('{'),
      })
    );

    // when and then
    const execution = networkClient.execute(request);
    await expect(execution).rejects.toBeInstanceOf(QonversionError);
    await expect(execution).rejects.toMatchObject({
      code: QonversionErrorCode.BackendError,
      details: 'Failed to parse JSON response',
      responseCode: 500,
    });
  });

  test('execute with whitespace-only json body', async () => {
    // given
    const request: NetworkRequest = {
      headers: testHeaders,
      type: RequestType.GET,
      url: testUrl
    };
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        status: 204,
        headers: {
          get: (header: string) => header === 'content-type' ? 'application/json' : null,
        },
        text: () => Promise.resolve('\n  '),
      })
    );

    // when
    const result = await networkClient.execute(request);

    // then
    expect(result).toStrictEqual({
      code: 204,
      payload: undefined,
    });
  });
});
