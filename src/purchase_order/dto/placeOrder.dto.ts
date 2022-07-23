import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty } from 'class-validator';

export class PlaceOrderDto {
  @ApiProperty({
    description: 'User id',
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Dish Id',
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  dish_id: string;
}
