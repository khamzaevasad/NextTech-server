import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
  STORE = 'STORE',
  ARTICLE = 'ARTICLE',
  PRODUCT = 'PRODUCT',
}
registerEnumType(ViewGroup, {
  name: 'ViewGroup',
});
