import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const mockUsersRepository = {
    findOneBy: jest.fn().mockImplementation((id) =>
      Promise.resolve({
        id: id.id,
        name: 'John Doe',
        cash_balance: '110.00',
      }),
    ),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('shoud return user', async () => {
    const user = await service.getById('01da8dea-cae9-4713-ae11-8d3f2f4d70f7');
    expect(user).toEqual({
      id: '01da8dea-cae9-4713-ae11-8d3f2f4d70f7',
      name: 'John Doe',
      cash_balance: '110.00',
    });
  });
});
