import { registerEnumType } from '@nestjs/graphql';

export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  BLOCK = 'BLOCK',
  DELETE = 'DELETE',
}

registerEnumType(StoreStatus, { name: 'StoreStatus' });

export enum StoreLocation {
  SEOUL = 'SEOUL',
  BUSAN = 'BUSAN',
  INCHEON = 'INCHEON',
  DAEGU = 'DAEGU',
  GYEONGJU = 'GYEONGJU',
  GWANGJU = 'GWANGJU',
  CHONJU = 'CHONJU',
  DAEJON = 'DAEJON',
  JEJU = 'JEJU',
}

registerEnumType(StoreStatus, { name: 'StoreStatus' });
