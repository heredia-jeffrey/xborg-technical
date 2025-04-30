import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { UserRepository } from '../user.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '../../prisma/constants';
import { mockCreateUser, mockUser } from './mocks';

describe('UserRepository Database Error Handling', () => {
  let userRepository: UserRepository;
  let mockPrismaService: {
    user: { findUniqueOrThrow: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    // Create a Jest mock for PrismaService with explicit jest.fn() mocks
    mockPrismaService = {
      user: {
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('find method database errors', () => {
    it('should handle Prisma client initialization errors', async () => {
      // Simulating an error during prisma client initialization
      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(
        new Error('PrismaClientInitializationError'),
      );

      await expect(userRepository.find({ id: mockUser.id })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle Prisma query engine errors', async () => {
      // Simulating a query engine error
      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(
        new Error('PrismaClientKnownRequestError'),
      );

      await expect(userRepository.find({ id: mockUser.id })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle database connection errors', async () => {
      // Simulating a connection error
      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(
        new Error('Could not open connection to database'),
      );

      await expect(userRepository.find({ id: mockUser.id })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('exists method database errors', () => {
    it('should correctly return false when database throws errors', async () => {
      // Simulating any prisma error
      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(
        new Error('Database error'),
      );

      const exists = await userRepository.exists({ id: 'invalid-id' });
      expect(exists).toBe(false);
    });

    it('should handle database protocol errors gracefully', async () => {
      // Simulating a protocol error
      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(
        new Error('Protocol error'),
      );

      const exists = await userRepository.exists({ id: mockUser.id });
      expect(exists).toBe(false);
    });
  });

  describe('create method database errors', () => {
    it('should handle specific Prisma constraint errors', async () => {
      // Different specific error codes from Prisma
      const constraintErrors = [
        { code: ERROR_CODES.UNIQUE_CONSTRAINT, expected: HttpException },
        { code: 'P2003', expected: InternalServerErrorException }, // Foreign key constraint
        { code: 'P2025', expected: InternalServerErrorException }, // Record not found
      ];

      for (const { code, expected } of constraintErrors) {
        const error = new Error(`Prisma error with code ${code}`) as any;
        error.code = code;
        mockPrismaService.user.create.mockRejectedValueOnce(error);

        await expect(
          userRepository.create(mockCreateUser as any),
        ).rejects.toThrow(expected);
      }
    });

    it('should handle database transaction failures', async () => {
      // Simulating a transaction failure
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Transaction failed'),
      );

      await expect(
        userRepository.create(mockCreateUser as any),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should handle database timeout errors during create', async () => {
      // Simulating a timeout error
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Query execution took too long'),
      );

      await expect(
        userRepository.create(mockCreateUser as any),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle database out of memory errors', async () => {
      // Simulating an out of memory error
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Out of memory'),
      );

      await expect(
        userRepository.create(mockCreateUser as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
