import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishModule } from 'src/dish/dish.module';
import { UserModule } from 'src/user/user.module';
import { PurchaseOrderController } from './purchase_order.controller';
import { PurchaseOrder } from './purchase_order.entity';
import { PurchaseOrderService } from './purchase_order.service';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder]), UserModule, DishModule],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [TypeOrmModule],
})
export class PurchaseOrderModule {}
