import {
  ApiHeader,
  NetworkClient,
  NetworkRequest,
  RawNetworkResponse,
  RequestHeaders,
  RequestType
} from '../../../src/internal/network';

const networkClient = new NetworkClient();

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
      json: () => Promise.resolve(testPayload),
    })
  );

  const savedFetch = global.fetch;

  beforeAll(() => {
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
});
