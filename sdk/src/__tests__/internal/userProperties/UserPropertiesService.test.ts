import {
  UserPropertiesSendResponse,
  UserPropertiesService,
  UserPropertiesServiceImpl, UserPropertyData
} from '../../../internal/userProperties';
import {
  ApiInteractor,
  RequestConfigurator,
  NetworkRequest,
  ApiResponseError,
  ApiResponseSuccess,
  RequestConfiguratorImpl,
  RequestType
} from '../../../internal/network';
import {QonversionError} from '../../../index';

let userPropertiesService: UserPropertiesService;
let requestConfigurator: RequestConfigurator;
let apiInteractor: ApiInteractor;
const testUserId = "Qon_test_user_id";

beforeEach(() => {
  requestConfigurator = new (RequestConfiguratorImpl as any)();
  apiInteractor = {
    execute: jest.fn(),
  };
  userPropertiesService = new UserPropertiesServiceImpl(requestConfigurator, apiInteractor);
});

describe('Send properties tests', () => {
  const testRequest: NetworkRequest = {
    body: {},
    headers: {},
    type: RequestType.POST,
    url: 'test url',
  };
  const testProperties = {
    a: 'a',
    b: 'b',
  };
  const testPropertiesData: UserPropertyData[] = [
    {key: 'a', value: 'a'},
    {key: 'b', value: 'b'},
  ];

  beforeEach(() => {
    requestConfigurator.configureUserPropertiesSendRequest = jest.fn(() => testRequest);
  });

  test('send properties success', async () => {
    // given
    const expResult: UserPropertiesSendResponse = {
      propertyErrors: [],
      savedProperties: [
        {key: 'a', value: 'a'},
        {key: 'b', value: 'b'},
      ],
    };
    const response: ApiResponseSuccess<UserPropertiesSendResponse> = {
      code: 200,
      data: expResult,
      isSuccess: true,
    };
    // @ts-ignore
    apiInteractor.execute = jest.fn(async () => response);

    // when
    const result = await userPropertiesService.sendProperties(testUserId, testProperties);

    // then
    expect(result).toStrictEqual(expResult);
    expect(requestConfigurator.configureUserPropertiesSendRequest).toBeCalledWith(testUserId, testPropertiesData);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('send properties partial success', async () => {
    // given
    const expResult: UserPropertiesSendResponse = {
      propertyErrors: [
        {key: 'a', error: 'failed'},
      ],
      savedProperties: [
        {key: 'b', value: 'b'},
      ],
    };
    const response: ApiResponseSuccess<UserPropertiesSendResponse> = {
      code: 200,
      data: expResult,
      isSuccess: true,
    };
    // @ts-ignore
    apiInteractor.execute = jest.fn(async () => response);

    // when
    const result = await userPropertiesService.sendProperties(testUserId, testProperties);

    // then
    expect(result).toStrictEqual(expResult);
    expect(requestConfigurator.configureUserPropertiesSendRequest).toBeCalledWith(testUserId, testPropertiesData);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('send properties error', async () => {
    // given
    const errorCode = 400;
    const errorMessage = 'test error message';
    const response: ApiResponseError = {
      code: errorCode,
      message: errorMessage,
      apiCode: '',
      type: '',
      isSuccess: false
    };
    apiInteractor.execute = jest.fn(async () => response);

    // when
    await expect(async () => {
      await userPropertiesService.sendProperties(testUserId, testProperties);
    }).rejects.toThrow(QonversionError);
    expect(requestConfigurator.configureUserPropertiesSendRequest).toBeCalledWith(testUserId, testPropertiesData);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });
});

describe('Get properties tests', () => {
  const testRequest: NetworkRequest = {
    body: undefined,
    headers: {},
    type: RequestType.GET,
    url: 'test url',
  };

  beforeEach(() => {
    requestConfigurator.configureUserPropertiesGetRequest = jest.fn(() => testRequest);
  });

  test('get properties success', async () => {
    // given
    const expResult: UserPropertyData[] = [
      {key: 'a', value: 'aa'},
      {key: 'b', value: 'bb'},
    ];
    const response: ApiResponseSuccess<UserPropertyData[]> = {
      code: 200,
      data: expResult,
      isSuccess: true,
    };
    // @ts-ignore
    apiInteractor.execute = jest.fn(async () => response);

    // when
    const result = await userPropertiesService.getProperties(testUserId);

    // then
    expect(result).toStrictEqual(expResult);
    expect(requestConfigurator.configureUserPropertiesGetRequest).toBeCalledWith(testUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('get properties error', async () => {
    // given
    const errorCode = 400;
    const errorMessage = 'test error message';
    const response: ApiResponseError = {
      code: errorCode,
      message: errorMessage,
      apiCode: '',
      type: '',
      isSuccess: false
    };
    apiInteractor.execute = jest.fn(async () => response);

    // when
    await expect(async () => {
      await userPropertiesService.getProperties(testUserId);
    }).rejects.toThrow(QonversionError);
    expect(requestConfigurator.configureUserPropertiesGetRequest).toBeCalledWith(testUserId);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });
});
