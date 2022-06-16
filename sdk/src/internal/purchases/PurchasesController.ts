import {PurchasesController, PurchasesService} from './types';
import {UserDataStorage} from '../user';
import {Logger} from '../logger';
import {PurchaseCoreData, StripeStoreData, UserPurchase} from '../../dto/Purchase';

export class PurchasesControllerImpl implements PurchasesController {
  private readonly purchasesService: PurchasesService;
  private readonly userDataStorage: UserDataStorage;
  private readonly logger: Logger;

  constructor(purchasesService: PurchasesService, userDataStorage: UserDataStorage, logger: Logger) {
    this.purchasesService = purchasesService;
    this.userDataStorage = userDataStorage;
    this.logger = logger;
  }

  async sendStripePurchase(data: PurchaseCoreData & StripeStoreData): Promise<UserPurchase> {
    try {
      const userId = this.userDataStorage.requireUserId();
      const userPurchase = await this.purchasesService.sendStripePurchase(userId, data);
      this.logger.info('Successfully send the Stripe purchase', userPurchase);
      return userPurchase;
    } catch (error) {
      this.logger.error('Failed to send the Stripe purchase', error);
      throw error;
    }
  }
}
