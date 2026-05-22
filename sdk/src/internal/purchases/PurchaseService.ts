import {PurchasesService, UserPurchaseApi} from './types';
import {PaddleStoreData, PurchaseCoreData, StripeStoreData, UserPurchase} from '../../dto/Purchase';
import {ApiInteractor, RequestConfigurator} from '../network';
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

  async sendStripePurchase(userId: string, data: PurchaseCoreData & StripeStoreData): Promise<UserPurchase> {
    const request = this.requestConfigurator.configureStripePurchaseRequest(userId, data);
    return this.executePurchaseRequest(request);
  }

  async sendPaddlePurchase(userId: string, data: PurchaseCoreData & PaddleStoreData): Promise<UserPurchase> {
    const request = this.requestConfigurator.configurePaddlePurchaseRequest(userId, data);
    return this.executePurchaseRequest(request);
  }

  private async executePurchaseRequest(request: ReturnType<RequestConfigurator['configureStripePurchaseRequest']>): Promise<UserPurchase> {
    const response = await this.apiInteractor.execute<UserPurchaseApi>(request);

    if (response.isSuccess) {
      return camelCaseKeys(response.data);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }
}
