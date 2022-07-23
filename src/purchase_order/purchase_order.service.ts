import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { Dish } from '../dish/dish.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
import { User } from '../user/user.entity';
import { Connection } from 'typeorm';
import { PurchaseOrder } from './purchase_order.entity';

@Injectable()
export class PurchaseOrderService {
  constructor(private connection: Connection) {}
  async placeOrder(user: User, dish: Dish): Promise<PurchaseOrder | null> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const purchaseOrder = new PurchaseOrder();
    purchaseOrder.dish = dish;
    purchaseOrder.user = user;
    purchaseOrder.restaurant = dish.restaurant;
    purchaseOrder.dish_name = dish.name;
    purchaseOrder.restaurant_name = dish.restaurant.name;
    purchaseOrder.transaction_amount = dish.price;
    purchaseOrder.transaction_date = moment().toDate();
    try {
      await queryRunner.manager.save(purchaseOrder);
      await queryRunner.manager.decrement(
        User,
        { id: user.id },
        'cash_balance',
        dish.price,
      );
      await queryRunner.manager.increment(
        Restaurant,
        { id: dish.restaurant.id },
        'cash_balance',
        dish.price,
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
      return purchaseOrder;
    }
  }
}
