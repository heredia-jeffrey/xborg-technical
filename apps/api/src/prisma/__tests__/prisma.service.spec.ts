import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StubbedInstance, stubInterface } from 'ts-sinon';
import { INestMicroservice } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  const mockConfigService: StubbedInstance<ConfigService> =
    stubInterface<ConfigService>();

  beforeEach(async () => {
    mockConfigService.get.returns('mock-database-url');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);

    // Mock the connect method to prevent actual connection attempts
    prismaService.$connect = jest.fn();
    prismaService.$on = jest.fn();
  });

  describe('onModuleInit', () => {
    it('should connect to the database', async () => {
      await prismaService.onModuleInit();

      expect(prismaService.$connect).toHaveBeenCalled();
    });
  });

  describe('enableShutdownHooks', () => {
    it('should set up beforeExit hook', async () => {
      const mockApp: StubbedInstance<INestMicroservice> =
        stubInterface<INestMicroservice>();

      await prismaService.enableShutdownHooks(mockApp);

      expect(prismaService.$on).toHaveBeenCalledWith(
        'beforeExit',
        expect.any(Function),
      );
    });
  });
});
