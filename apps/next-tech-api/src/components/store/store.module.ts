import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreResolver } from './store.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import StoreSchema from '../../schemas/Store.model';
import { ViewModule } from '../view/view.module';
import { AuthModule } from '../auth/auth.module';
import { LikeModule } from '../like/like.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Store', schema: StoreSchema }]),
    AuthModule,
    ViewModule,
    LikeModule,
  ],
  providers: [StoreService, StoreResolver],
  exports: [StoreService],
})
export class StoreModule {}
