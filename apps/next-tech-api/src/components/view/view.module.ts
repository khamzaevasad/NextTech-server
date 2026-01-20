import { Module } from '@nestjs/common';
import { ViewService } from './view.service';
import ViewSchema from '../../schemas/View.model';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'View', schema: ViewSchema }]),
    AuthModule,
    ViewModule,
  ],
  providers: [ViewService],
  exports: [ViewService],
})
export class ViewModule {}
