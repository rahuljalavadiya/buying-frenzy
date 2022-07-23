import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DishModule } from 'src/dish/dish.module';
import { OpeningHourModule } from 'src/opening_hour/opening_hour.module';
import { RestaurantController } from './restaurant.controller';
import { Restaurant } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant]),
    OpeningHourModule,
    DishModule,
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
})
export class RestaurantModule {}
