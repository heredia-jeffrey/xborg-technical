import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { INestMicroservice } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

describe('PrismaService Integration Tests', () => {
  let prismaService: PrismaService;
  let mockApp: INestMicroservice;
  let mockConfigService: { get: jest.Mock };

  beforeEach(() => {
    // Mock ConfigService
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'DATABASE_URL') {
          return 'postgresql://test:test@localhost:5432/testdb?schema=test';
        }
        return undefined;
      }),
    };

    // Mock app for enableShutdownHooks
    mockApp = {
      close: jest.fn(),
    } as unknown as INestMicroservice;
  });

  beforeAll(async () => {
    // This will be instantiated in beforeEach
    mockConfigService = { get: jest.fn() };
  });

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    // This will call the constructor which should call mockConfigService.get
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    
    // Mock the database connection methods
    prismaService.$connect = jest.fn().mockResolvedValue(undefined);
    prismaService.$on = jest.fn().mockImplementation((event, callback) => {
      if (event === 'beforeExit') {
        // Store the callback for later testing
        (prismaService as any).beforeExitCallback = callback;
      }
      return prismaService;
    });
  });

  describe('onModuleInit', () => {
    it('should connect to the database on initialization', async () => {
      // Act
      await prismaService.onModuleInit();

      // Assert
      expect(prismaService.$connect).toHaveBeenCalled();
    });
  });

  describe('enableShutdownHooks', () => {
    it('should register a beforeExit handler that closes the app', async () => {
      // Act
      await prismaService.enableShutdownHooks(mockApp);

      // Assert
      expect(prismaService.$on).toHaveBeenCalledWith('beforeExit', expect.any(Function));
      
      // Manually trigger the beforeExit callback to test it closes the app
      const callback = (prismaService as any).beforeExitCallback;
      await callback();
      expect(mockApp.close).toHaveBeenCalled();
    });
  });

  describe('database connection', () => {
    it('should be initialized with the correct database URL', () => {
      // Assert - Constructor should have called get with DATABASE_URL
      expect(mockConfigService.get).toHaveBeenCalledWith('DATABASE_URL');
    });
  });
}); 