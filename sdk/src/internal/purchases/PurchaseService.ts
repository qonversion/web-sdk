import {PurchasesService, UserPurchaseApi} from './types';
import {PurchaseCoreData, StripeStoreData, UserPurchase} from '../../dto/Purchase';
import {IApiInteractor, IRequestConfigurator} from '../network';
import {camelcaseKeys} from '../utils/objectUtils';
import {QonversionError} from '../../exception/QonversionError';
import {QonversionErrorCode} from '../../exception/QonversionErrorCode';

export class PurchaseServiceImpl implements PurchasesService {
  private readonly requestConfigurator: IRequestConfigurator;
  private readonly apiInteractor: IApiInteractor;

  constructor(requestConfigurator: IRequestConfigurator, apiInteractor: IApiInteractor) {
    this.requestConfigurator = requestConfigurator;
    this.apiInteractor = apiInteractor;
  }

  async sendStripePurchase(userId: string, data: PurchaseCoreData & StripeStoreData): Promise<UserPurchase> {
    const request = this.requestConfigurator.configureStripePurchaseRequest(userId, data);
    const response = await this.apiInteractor.execute<UserPurchaseApi>(request);

    if (response.isSuccess) {
      return camelcaseKeys(response.data);
    }

    const errorMessage = `Response code ${response.code}, message: ${response.message}`;
    throw new QonversionError(QonversionErrorCode.BackendError, errorMessage);
  }
}