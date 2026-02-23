import { Module } from '@nestjs/common';
import { FaqResolver } from './faq.resolver';
import { FaqService } from './faq.service';
import { MongooseModule } from '@nestjs/mongoose';
import FaqSchema from '../../schemas/Faq.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Faq', schema: FaqSchema }]), AuthModule],
  providers: [FaqResolver, FaqService],
})
export class FaqModule {}
