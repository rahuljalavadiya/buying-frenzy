import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { DishService } from '../dish/dish.service';
import { UserService } from '../user/user.service';
import { PlaceOrderDto } from './dto/placeOrder.dto';
import { PurchaseOrderService } from './purchase_order.service';

@Controller('purchase-order')
export class PurchaseOrderController {
  constructor(
    private readonly service: PurchaseOrderService,
    private readonly userService: UserService,
    private readonly dishService: DishService,
  ) {}

  @Post('place-order')
  @ApiNotFoundResponse({ description: 'If user or dish not exist!' })
  @ApiBadRequestResponse({ description: 'You have unsufficent balance!' })
  @ApiInternalServerErrorResponse({
    description: 'Something went wrong while place order!',
  })
  @ApiOkResponse({ description: 'If place order successfully! return object' })
  async placeOrder(@Res() res, @Body() placeOrderDto: PlaceOrderDto) {
    const user = await this.userService.getById(placeOrderDto.user_id);
    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send('User does not exist!');
    }

    const dish = await this.dishService.getById(placeOrderDto.dish_id);
    if (!dish) {
      return res.status(HttpStatus.NOT_FOUND).send('Dish does not exist!');
    }

    if (dish.price > user.cash_balance) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('You have unsufficent balance!');
    }
    const purchaseOrder = await this.service.placeOrder(user, dish);
    if (!purchaseOrder) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Something went wrong while place order!');
    }

    return res.status(HttpStatus.OK).send({
      id: purchaseOrder.id,
      dish_name: purchaseOrder.dish_name,
      transaction_amount: purchaseOrder.transaction_amount,
      transaction_date: purchaseOrder.transaction_date,
      restaurant_name: purchaseOrder.restaurant_name,
    });
  }
}
