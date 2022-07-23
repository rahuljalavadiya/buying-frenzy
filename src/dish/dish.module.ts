import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from './dish.entity';
import { DishService } from './dish.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dish])],
  exports: [TypeOrmModule, DishService],
  providers: [DishService],
})
export class DishModule {}
