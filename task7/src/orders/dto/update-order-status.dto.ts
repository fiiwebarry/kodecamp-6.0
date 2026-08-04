import { IsEnum } from 'class-validator';

import { OrderStatus } from '../order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: `status must be one of: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;
}
