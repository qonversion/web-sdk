import {UserPropertiesService, UserPropertiesServiceImpl} from '../../../src/internal/userProperties';
import {
  IApiInteractor,
  IRequestConfigurator,
  NetworkRequest, NetworkResponseError,
  NetworkResponseSuccess,
  RequestType
} from '../../../src/internal/network';
import {QonversionError} from '../../../src';

describe('UserPropertiesService tests', () => {
  let userPropertiesService: UserPropertiesService;
  let requestConfigurator: IRequestConfigurator;
  let apiInteractor: IApiInteractor;
  let testRequest: NetworkRequest = {
    body: {},
    headers: {},
    type: RequestType.POST,
    url: 'test url',
  };
  let testProperties = {
    a: 'a',
    b: 'b',
  };

  beforeEach(() => {
    // @ts-ignore
    requestConfigurator = {
      configureUserPropertiesRequest: jest.fn(() => testRequest),
    };
    apiInteractor = {
      execute: jest.fn(),
    };
    userPropertiesService = new UserPropertiesServiceImpl(requestConfigurator, apiInteractor);
  });

  test('send properties success', async () => {
    // given
    const expResult = ['a', 'b'];
    const response: NetworkResponseSuccess<{processed: string[]}> = {
      code: 200,
      data: {processed: expResult},
      isSuccess: true,
    };
    // @ts-ignore
    apiInteractor.execute = jest.fn(async () => response);

    // when
    const result = await userPropertiesService.sendProperties(testProperties);

    // then
    expect(result).toStrictEqual(expResult);
    expect(requestConfigurator.configureUserPropertiesRequest).toBeCalledWith(testProperties);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });

  test('send properties error', async () => {
    // given
    const errorCode = 400;
    const errorMessage = 'test error message';
    const response: NetworkResponseError = {
      code: errorCode,
      message: errorMessage,
      apiCode: '',
      type: '',
      isSuccess: false
    };
    // @ts-ignore
    apiInteractor.execute = jest.fn(async () => response);

    // when
    await expect(async () => {
      await userPropertiesService.sendProperties(testProperties);
    }).rejects.toThrow(QonversionError);
    expect(requestConfigurator.configureUserPropertiesRequest).toBeCalledWith(testProperties);
    expect(apiInteractor.execute).toBeCalledWith(testRequest);
  });
});
