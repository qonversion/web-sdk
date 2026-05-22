import {PurchasesService, UserPurchaseApi} from './types';
import {
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
    // Wire format uses "non_recurring" for one-time purchases (matches the
    // shared UserPurchaseProductType enum on the server); the SDK exposes it
    // as the Paddle-native "inapp". Normalize on the read path.
    if (purchase.paddleStoreData && (purchase.paddleStoreData.type as string) === 'non_recurring') {
      purchase.paddleStoreData.type = 'inapp';
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
