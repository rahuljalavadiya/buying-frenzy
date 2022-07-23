import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Dish } from '../dish/dish.entity';
import { OpeningHour } from '../opening_hour/opening_hour.entity';
import { In, Repository } from 'typeorm';
import { operationsType, searchType } from './restaurant.controller';
import { Restaurant } from './restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(OpeningHour)
    private OpeningHourRepository: Repository<OpeningHour>,
    @InjectRepository(Dish)
    private dishRepository: Repository<Dish>,
  ) {}

  async getResturantsOpensAt(opensAt: Date): Promise<Restaurant[]> {
    const moemntOpensAt = moment(opensAt);
    const day = moemntOpensAt.format('ddd');
    const OpeningHoursResults =
      await this.OpeningHourRepository.createQueryBuilder()
        .where('weekday = :day', { day })
        .andWhere(
          ' ( (opens_at <= :opens_at AND closes_at >= :opens_at AND overnight = 0 ) OR ( (closes_at >= :opens_at OR opens_at <= :opens_at ) AND overnight = 1 ) )',
          { opens_at: opensAt },
        )
        .select('distinct restaurantId')
        .getRawMany();

    if (OpeningHoursResults.length > 0) {
      const restaurantIds = OpeningHoursResults.map((openingHourRow) => {
        return openingHourRow.restaurantId;
      });

      return this.getRestaurantsByIds(restaurantIds);
    }
    return [];
  }

  async getResturantsFilterByPrice(
    fromPrice: number,
    toPrice: number,
    dishes: number,
    operation: operationsType,
  ): Promise<Restaurant[]> {
    let minMaxQueryOperator = '>=';
    if (operation === operationsType.max) {
      minMaxQueryOperator = '<=';
    }
    const dishesResults = await this.dishRepository
      .createQueryBuilder()
      .where('price >= :from_price')
      .andWhere('price <= :to_price')
      .groupBy('dish.restaurantId')
      .having(`count(dish.restaurantId) ${minMaxQueryOperator} :dishes`)
      .setParameters({ from_price: fromPrice, to_price: toPrice, dishes })
      .select('dish.restaurantId')
      .getRawMany();

    if (dishesResults.length > 0) {
      const restaurantIds = dishesResults.map((dishRow) => {
        return dishRow.restaurantId;
      });

      return this.getRestaurantsByIds(restaurantIds);
    }

    return [];
  }

  async getRestaurantsByIds(ids: string[]): Promise<Restaurant[]> {
    return Restaurant.find({
      where: {
        id: In(ids),
      },
      order: {
        name: 'ASC',
      },
      select: ['id', 'name', 'cash_balance'],
    });
  }

  getResultBySearch(
    keyword: string,
    type: searchType,
  ): Promise<Restaurant[] | Dish[]> {
    if (type == searchType.dish) {
      return this.getDishesBySearchName(keyword);
    } else if (type == searchType.restaurant) {
      return this.getRestaurantsBySearchName(keyword);
    }
  }

  getDishesBySearchName(keyword: string): Promise<Dish[]> {
    return this.dishRepository
      .createQueryBuilder()
      .where('name Like :keyword', { keyword: `%${keyword}%` })
      .orderBy(`INSTR(name, '${keyword}' ) `)
      .getRawMany();
  }

  getRestaurantsBySearchName(keyword: string): Promise<Restaurant[]> {
    return this.restaurantRepository
      .createQueryBuilder()
      .where('name Like :keyword', { keyword: `%${keyword}%` })
      .orderBy(`INSTR(name, '${keyword}' ) `)
      .getRawMany();
  }
}
