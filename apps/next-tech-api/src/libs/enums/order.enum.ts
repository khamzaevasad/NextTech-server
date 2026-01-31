import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  PAUSE = 'PAUSE',
  PROCESS = 'PROCESS',
  FINISH = 'FINISH',
  DELETE = 'DELETE',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});
