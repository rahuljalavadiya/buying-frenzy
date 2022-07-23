import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dish } from '../dish/dish.entity';
import { OpeningHour } from '../opening_hour/opening_hour.entity';
import { Restaurant } from './restaurant.entity';
import { RestaurantService } from './restaurant.service';

describe('RestaurantService', () => {
  let service: RestaurantService;

  const mockRestaurantRepository = {};

  const mockDishRepository = {};

  const mockOpeningHourRepository = {};
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<RestaurantService>(RestaurantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
