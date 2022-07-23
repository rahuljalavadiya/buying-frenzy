import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Connection } from 'typeorm';
import { PurchaseOrderService } from './purchase_order.service';
import { Dish } from '../dish/dish.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
const mockConnection = () => ({
  transaction: jest.fn(),
  createQueryRunner: jest.fn().mockImplementation(() => {
    return {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      release: jest.fn(),
    };
  }),
});

export class UserRepositoryFake {}

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrderService,
        {
          provide: Connection,
          useFactory: mockConnection,
        },
        {
          provide: getRepositoryToken(User),
          useClass: UserRepositoryFake,
        },
      ],
    }).compile();

    service = module.get<PurchaseOrderService>(PurchaseOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be place order', async () => {
    const userId = '0133f123-3413-4074-90c4-2dc7f0202af8';
    const user = new User();
    user.id = userId;
    user.name = 'John Doe';
    user.cash_balance = 110;

    const restaurant = new Restaurant();
    restaurant.id = 'c5a18788-ee17-4d89-8585-8caed46296ce';
    restaurant.name = 'Test';
    restaurant.cash_balance = 120;

    const dishId = '001096c6-cf6c-4efc-b39c-a0722aac969e';
    const dish = new Dish();
    dish.id = dishId;
    dish.name = 'King William';
    dish.restaurant = restaurant;
    dish.price = 10;

    const placeOrder = await service.placeOrder(user, dish);
    expect(placeOrder).toBeDefined();
  });
});
