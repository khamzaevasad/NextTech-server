import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
  STORE = 'STORE',
  ARTICLE = 'ARTICLE',
  PRODUCT = 'PRODUCT',
  NOTICE = 'NOTICE',
}
registerEnumType(ViewGroup, {
  name: 'ViewGroup',
});
