import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'typeorm';
import { AppService } from './app.service';

jest.mock('rxjs', () => {
  const original = jest.requireActual('rxjs');

  return {
    ...original,
    firstValueFrom: () =>
      new Promise((resolve) => {
        resolve(true);
      }),
  };
});
const mockHttpService = {
  get: jest.fn(),
};

const mockConnection = () => ({
  transaction: jest.fn(),
});

describe('App service', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: Connection,
          useFactory: mockConnection,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be import data into database', async () => {
    await service.importDatabase();
  });
});
