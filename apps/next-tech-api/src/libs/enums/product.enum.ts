import { registerEnumType } from '@nestjs/graphql';

export enum ProductStatus {
  PAUSE = 'PAUSE',
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

registerEnumType(ProductStatus, {
  name: 'ProductStatus',
});
