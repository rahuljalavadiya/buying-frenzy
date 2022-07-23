import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DishService } from '../dish/dish.service';
import { UserService } from '../user/user.service';
import { Connection } from 'typeorm';
import { Dish } from '../dish/dish.entity';
import { User } from '../user/user.entity';
import { PurchaseOrderController } from './purchase_order.controller';
import { PurchaseOrderService } from './purchase_order.service';
const mockDishRepository = {};

const mockUserRepository = {};
const mockConnection = () => ({
  transaction: jest.fn(),
});
describe('PurchaseOrderController', () => {
  let controller: PurchaseOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrderController],
      providers: [
        PurchaseOrderService,
        UserService,
        DishService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Dish),
          useValue: mockDishRepository,
        },
        {
          provide: Connection,
          useFactory: mockConnection,
        },
      ],
    }).compile();

    controller = module.get<PurchaseOrderController>(PurchaseOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
