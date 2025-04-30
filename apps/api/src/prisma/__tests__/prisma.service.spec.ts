import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { INestMicroservice } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;
  let configService: ConfigService;

  beforeEach(async () => {
    // Simple mock for ConfigService
    configService = {
      get: jest.fn().mockReturnValue('mock-db-url'),
    } as any;

    // Create test module
    const moduleRef = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    prismaService = moduleRef.get<PrismaService>(PrismaService);

    // Mock connection methods after getting the service
    prismaService.$connect = jest.fn().mockResolvedValue(undefined);
    prismaService.$on = jest.fn();
    prismaService.$transaction = jest.fn().mockImplementation(async (fn) => {
      if (typeof fn === 'function') {
        return await fn(prismaService);
      }
      return Promise.resolve(fn);
    });
  });

  describe('connection handling', () => {
    it('should connect to database on init', async () => {
      // Call the method directly
      await prismaService.onModuleInit();
      expect(prismaService.$connect).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      // Setup error scenario
      prismaService.$connect = jest
        .fn()
        .mockRejectedValueOnce(new Error('Connection error'));

      // Test that the error is propagated
      await expect(prismaService.onModuleInit()).rejects.toThrow(
        'Connection error',
      );
    });
  });

  describe('transaction handling', () => {
    it('should handle simple transactions', async () => {
      const transactionFn = async () => 'test-result';

      await expect(
        prismaService.$transaction(transactionFn),
      ).resolves.toBeDefined();
    });

    it('should handle transaction errors', async () => {
      // Create a transaction function that throws an error
      const failingTransactionFn = async () => {
        throw new Error('Transaction failed');
      };

      // Ensure the error propagates correctly
      await expect(
        prismaService.$transaction(failingTransactionFn),
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('shutdown hooks', () => {
    it('should setup shutdown hooks', async () => {
      const mockApp = {
        close: jest.fn().mockResolvedValue(undefined),
      } as unknown as INestMicroservice;

      await prismaService.enableShutdownHooks(mockApp);

      expect(prismaService.$on).toHaveBeenCalledWith(
        'beforeExit',
        expect.any(Function),
      );
    });
  });
});
