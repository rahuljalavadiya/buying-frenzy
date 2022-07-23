import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Dish } from '../dish/dish.entity';
import { Restaurant } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';

export enum operationsType {
  min = 'min',
  max = 'max',
}
export enum searchType {
  restaurant = 'restaurant',
  dish = 'dish',
}
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly service: RestaurantService) {}

  @Get('all')
  @ApiQuery({ name: 'opens_at', type: Date })
  @ApiOperation({
    summary:
      'Get restaurants which open at the given `opens_at` time. For example: opens_at: 2022-07-23 21:03:00',
  })
  @ApiResponse({
    status: 200,
    description: ' Fetch restaurants which opens at certain time.',
  })
  async getResturants(@Query('opens_at') opensAt: Date): Promise<Restaurant[]> {
    return this.service.getResturantsOpensAt(opensAt);
  }

  @Get('filter-by-price')
  @ApiQuery({ name: 'from_price', type: Number })
  @ApiQuery({ name: 'to_price', type: Number })
  @ApiQuery({ name: 'dishes', type: Number })
  @ApiQuery({ name: 'operation', enum: operationsType })
  @ApiOperation({
    summary:
      'Get List top y restaurants that have more or less than x number of dishes within a price range. operation parameter can be "min" or "max" For example: from_price: 10, to_price: 20, dishes=20, operation= min',
  })
  @ApiResponse({
    status: 200,
    description: ' Fetch restaurants by price range and dishes count.',
  })
  async getResturantsFilterByPrice(
    @Query('from_price') fromPrice: number,
    @Query('to_price') toPrice: number,
    @Query('dishes') dishes: number,
    @Query('operation') operation: operationsType,
  ): Promise<Restaurant[]> {
    return this.service.getResturantsFilterByPrice(
      fromPrice,
      toPrice,
      dishes,
      operation,
    );
  }

  @Get('search-by-keyword')
  @ApiQuery({ name: 'keyword', type: String })
  @ApiQuery({ name: 'type', enum: searchType })
  @ApiOperation({
    summary:
      'Search for restaurants or dishes by name, ranked by relevance to search term For example: keyword: "La", type="restaurant"',
  })
  @ApiResponse({
    status: 200,
    description: ' Fetch restaurants which opens at certain time.',
  })
  async getResultBySearch(
    @Query('keyword') keyword: string,
    @Query('type') type: searchType,
  ): Promise<Restaurant[] | Dish[]> {
    return this.service.getResultBySearch(keyword, type);
  }
}
