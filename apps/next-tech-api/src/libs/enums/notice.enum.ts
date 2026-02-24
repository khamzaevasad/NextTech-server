import { registerEnumType } from '@nestjs/graphql';

export enum NoticeCategory {
  FAQ = 'FAQ',
  TERMS = 'TERMS',
  INQUIRY = 'INQUIRY',
}
registerEnumType(NoticeCategory, {
  name: 'NoticeCategory',
});

export enum NoticeStatus {
  HOLD = 'HOLD',
  ACTIVE = 'ACTIVE',
  DELETE = 'DELETE',
  EVENT = 'EVENT',
}
registerEnumType(NoticeStatus, {
  name: 'NoticeStatus',
});
