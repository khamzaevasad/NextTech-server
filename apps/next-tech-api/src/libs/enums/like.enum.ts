import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
  STORE = 'STORE',
  PRODUCT = 'PRODUCT',
  ARTICLE = 'ARTICLE',
}
registerEnumType(LikeGroup, {
  name: 'LikeGroup',
});
