import {PurchasesService, UserPurchaseApi} from './types';
import {PurchaseCoreData, StripeStoreData, UserPurchase} from '../../dto/Purchase';
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
    const response = await this.apiInteractor.execute<UserPurchaseApi>(request);

    if (response.isSuccess) {
      return camelCaseKeys(response.data);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }
}
