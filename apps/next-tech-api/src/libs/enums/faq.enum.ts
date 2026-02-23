import { registerEnumType } from '@nestjs/graphql';

export enum FaqCategory {
  GENERAL = 'GENERAL',
  PAYMENT = 'PAYMENT',
  ACCOUNT = 'ACCOUNT',
  SERVICE = 'SERVICE',
  SELLER = 'SELLER',
}

registerEnumType(FaqCategory, { name: 'FaqCategory' });
