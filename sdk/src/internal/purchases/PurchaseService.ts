import {PaddleStoreDataApi, PurchasesService, UserPurchaseApi} from './types';
import {
  PaddlePurchaseType,
  PaddleStoreData,
  PurchaseCoreData,
  StripeStoreData,
  UserPaddlePurchase,
  UserStripePurchase,
} from '../../dto/Purchase';
import {ApiInteractor, NetworkRequest, RequestConfigurator} from '../network';
import {camelCaseKeys} from '../utils/objectUtils';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

export class PurchaseServiceImpl implements PurchasesService {
  private readonly requestConfigurator: RequestConfigurator;
  private readonly apiInteractor: ApiInteractor;

  constructor(requestConfigurator: RequestConfigurator, apiInteractor: ApiInteractor) {
    this.requestConfigurator = requestConfigurator;
    this.apiInteractor = apiInteractor;
  }

  async sendStripePurchase(userId: string, data: PurchaseCoreData & StripeStoreData): Promise<UserStripePurchase> {
    const request = this.requestConfigurator.configureStripePurchaseRequest(userId, data);
    return this.executePurchaseRequest<UserStripePurchase>(request);
  }

  async sendPaddlePurchase(userId: string, data: PurchaseCoreData & PaddleStoreData): Promise<UserPaddlePurchase> {
    const request = this.requestConfigurator.configurePaddlePurchaseRequest(userId, data);
    const purchase = await this.executePurchaseRequest<UserPaddlePurchase>(request);
    if (purchase.paddleStoreData) {
      // The response from the api comes back with the wire-shape type literal
      // ("non_recurring" / "subscription"); normalize to the SDK shape
      // ("inapp" / "subscription") at the boundary so callers never see the
      // wire literal.
      purchase.paddleStoreData.type = paddleWireTypeToSdk(
        (purchase.paddleStoreData as unknown as PaddleStoreDataApi).type,
      );
    }
    return purchase;
  }

  private async executePurchaseRequest<T>(request: NetworkRequest): Promise<T> {
    const response = await this.apiInteractor.execute<UserPurchaseApi>(request);

    if (response.isSuccess) {
      return camelCaseKeys(response.data);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }
}

// Inverse of paddleSdkTypeToWire in RequestConfigurator. Exhaustive switch +
// `never` default makes adding a new wire variant a type-check failure
// instead of an undefined runtime cast.
function paddleWireTypeToSdk(wire: PaddleStoreDataApi['type']): PaddlePurchaseType {
  switch (wire) {
    case 'subscription':
      return 'subscription';
    case 'non_recurring':
      return 'inapp';
    default: {
      const _exhaustive: never = wire;
      throw new Error(`unhandled wire paddle type: ${String(_exhaustive)}`);
    }
  }
}
