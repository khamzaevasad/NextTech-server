import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron } from '@nestjs/schedule';
import { BATCH_ROLLBACK, BATCH_TOP_SELLERS, BATCH_TOP_STORES } from './lib/config';

@Controller()
export class BatchController {
  private logger = new Logger('BatchController');
  constructor(private readonly batchService: BatchService) {}

  @Get()
  getHello(): string {
    return this.batchService.getHello();
  }

  /* ------------------------------ batchRollback ----------------------------- */
  @Cron('00 00 01 * * *', { name: BATCH_ROLLBACK })
  public async batchRollback() {
    try {
      this.logger['context'] = BATCH_ROLLBACK;
      this.logger.debug('EXECUTED');
      await this.batchService.batchRollback();
    } catch (err) {
      this.logger.error(err);
    }
  }

  /* ---------------------------- batchTopProducts ---------------------------- */
  @Cron('20 00 01  * * *', { name: BATCH_TOP_SELLERS })
  public async batchTopSellers() {
    try {
      this.logger['context'] = BATCH_TOP_SELLERS;
      this.logger.debug('EXECUTED');
      await this.batchService.batchTopSellers();
    } catch (err) {
      this.logger.error(err);
    }
  }

  /* ----------------------------- batchTopStores ----------------------------- */
  @Cron('40 00 01 * * *', { name: BATCH_TOP_STORES })
  public async batchTopStores() {
    try {
      this.logger['context'] = BATCH_TOP_STORES;
      this.logger.debug('EXECUTED');
      await this.batchService.batchTopStores();
    } catch (err) {
      this.logger.error(err);
    }
  }
}
