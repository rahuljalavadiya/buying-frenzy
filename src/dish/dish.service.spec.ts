import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Dish } from './dish.entity';
import { DishService } from './dish.service';

describe('DishService', () => {
  let service: DishService;

  const mockDishRepository = {
    findOneBy: jest.fn().mockImplementation((id) =>
      Promise.resolve({
        id: id.id,
        name: 'Mini-Schweinsbraten mit Kart. Knodel',
        price: '11.28',
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DishService,
        {
          provide: getRepositoryToken(Dish),
          useValue: mockDishRepository,
        },
      ],
    }).compile();

    service = module.get<DishService>(DishService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('shoud return dish', async () => {
    const dish = await service.getById('0002e588-3772-4589-aecc-32317816bcdf');
    expect(dish).toEqual({
      id: '0002e588-3772-4589-aecc-32317816bcdf',
      name: 'Mini-Schweinsbraten mit Kart. Knodel',
      price: '11.28',
    });
  });
});
