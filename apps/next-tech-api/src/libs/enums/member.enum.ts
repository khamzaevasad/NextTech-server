import { registerEnumType } from '@nestjs/graphql';

export enum MemberType {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

registerEnumType(MemberType, { name: 'MemberType' });

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  BLOCK = 'BLOCK',
  DELETE = 'DELETE',
}

registerEnumType(MemberStatus, { name: 'MemberStatus' });

export enum MemberAuthType {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  TELEGRAM = 'TELEGRAM',
}

registerEnumType(MemberAuthType, { name: 'MemberAuthType' });
