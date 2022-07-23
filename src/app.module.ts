import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import ormConfig from './config/ormconfig';
import { ConfigModule } from '@nestjs/config';
import { RestaurantModule } from './restaurant/restaurant.module';
import { PurchaseOrderModule } from './purchase_order/purchase_order.module';
import { DishModule } from './dish/dish.module';
import { UserModule } from './user/user.module';
import { OpeningHourModule } from './opening_hour/opening_hour.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    HttpModule,
    ConfigModule.forRoot(),
    OpeningHourModule,
    RestaurantModule,
    DishModule,
    UserModule,
    PurchaseOrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
