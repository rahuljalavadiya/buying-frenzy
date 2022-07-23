import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dish } from '../dish/dish.entity';
import { OpeningHour } from '../opening_hour/opening_hour.entity';
import { RestaurantController } from './restaurant.controller';
import { Restaurant } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';
const mockRestaurantRepository = {};

const mockDishRepository = {};

const mockOpeningHourRepository = {};
describe('RestaurantController', () => {
  let controller: RestaurantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantController],
      providers: [
        RestaurantService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRestaurantRepository,
        },
        {
          provide: getRepositoryToken(OpeningHour),
          useValue: mockOpeningHourRepository,
        },
        {
          provide: getRepositoryToken(Dish),
          useValue: mockDishRepository,
        },
      ],
    }).compile();

    controller = module.get<RestaurantController>(RestaurantController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
