import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { UserRepository } from '../user.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { mockUser } from './mocks';

describe('UserRepository Error Response Format Tests', () => {
  let userRepository: UserRepository;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn(),
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

  describe('Repository Error Response Format Tests', () => {
    it('should format Prisma not found errors as NotFoundException with correct format', async () => {
      // Simulate Prisma throwing a P2025 error (record not found)
      const notFoundError = new PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '4.0.0',
        },
      );

      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(notFoundError);

      try {
        await userRepository.find({ id: 'non-existent-id' });
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as NotFoundException;
        expect(httpError).toBeInstanceOf(NotFoundException);
        // The default message is used in the implementation
        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 404);
        expect(response).toHaveProperty('message');
      }
    });

    it('should format Prisma unique constraint errors with correct format', async () => {
      // Simulate Prisma throwing a P2002 error (unique constraint violation)
      const uniqueConstraintError = new PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          code: 'P2002',
          clientVersion: '4.0.0',
          meta: {
            target: ['email'],
          },
        },
      );

      mockPrismaService.user.create.mockRejectedValue(uniqueConstraintError);

      try {
        await userRepository.create({
          address: 'test-address',
          userName: 'test-user',
          email: 'existing@example.com',
        });
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as HttpException;
        expect(httpError).toBeInstanceOf(HttpException);
        expect(httpError.getStatus()).toBe(409);
        expect(httpError.message).toBe('User exists');
      }
    });

    it('should format Prisma other errors as InternalServerErrorException', async () => {
      // Simulate a generic Prisma error
      const genericError = new Error('Database operation failed');
      mockPrismaService.user.create.mockRejectedValue(genericError);

      try {
        await userRepository.create({
          address: 'test-address',
          userName: 'test-user',
          email: 'test@example.com',
        });
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as InternalServerErrorException;
        expect(httpError).toBeInstanceOf(InternalServerErrorException);
        expect(httpError.getStatus()).toBe(500);
        expect(httpError.message).toBe('Failed to create user');
      }
    });
  });
});
