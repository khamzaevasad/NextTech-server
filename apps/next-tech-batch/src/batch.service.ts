import { Injectable } from '@nestjs/common';

@Injectable()
export class BatchService {
  getHello(): string {
    return 'Welcome to Next Tech batch server!';
  }
  /* ------------------------------ batchRollback ----------------------------- */
  public async batchRollback() {
    console.log('batchRollback');
  }

  /* ---------------------------- batchTopProducts ---------------------------- */
  public async batchTopProducts() {
    console.log('batchTopProducts');
  }
  /* ----------------------------- batchTopStores ----------------------------- */
  public async batchTopStores() {
    console.log('batchTopStores');
  }
}
