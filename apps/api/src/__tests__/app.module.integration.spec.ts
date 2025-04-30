import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('AppModule Integration Tests', () => {
  let app: TestingModule;

  beforeAll(async () => {
    // Mock configuration for testing
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'DATABASE_URL') {
          return 'postgresql://test:test@localhost:5432/testdb?schema=test';
        }
        return undefined;
      }),
    };

    app = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(ConfigService)
    .useValue(mockConfigService)
    .compile();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Module Structure', () => {
    it('should have ConfigService available', () => {
      // Act
      const configService = app.get<ConfigService>(ConfigService);
      
      // Assert
      expect(configService).toBeDefined();
    });

    it('should have PrismaService available', () => {
      // Act
      const prismaService = app.get<PrismaService>(PrismaService);
      
      // Assert
      expect(prismaService).toBeDefined();
    });

    it('should have UserService available', () => {
      // Act
      const userService = app.get<UserService>(UserService);
      
      // Assert
      expect(userService).toBeDefined();
    });

    it('should have UserRepository available', () => {
      // Act
      const userRepository = app.get<UserRepository>(UserRepository);
      
      // Assert
      expect(userRepository).toBeDefined();
    });
  });

  describe('Dependency Graph', () => {
    it('should have UserService with proper dependencies', () => {
      // Act
      const userService = app.get<UserService>(UserService);
      
      // Assert
      expect(userService).toHaveProperty('userRepository');
    });

    it('should have UserRepository with proper dependencies', () => {
      // Act
      const userRepository = app.get<UserRepository>(UserRepository);
      
      // Assert
      expect(userRepository).toHaveProperty('prisma');
    });

    it('should have PrismaService with proper dependencies', () => {
      // Act
      const prismaService = app.get<PrismaService>(PrismaService);
      
      // Assert
      expect(prismaService).toHaveProperty('config');
    });
  });
}); 