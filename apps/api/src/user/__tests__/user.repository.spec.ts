import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StubbedInstance, stubInterface } from 'ts-sinon';

import { UserRepository } from '../user.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '../../prisma/constants';
import { mockCreateUser, mockUser } from './mocks';

describe('UserRepository', () => {
  let userRepository: UserRepository;

  const mockPrismaService: StubbedInstance<PrismaService> =
    stubInterface<PrismaService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        UserRepository,
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('find', () => {
    it('should successfully find user', async () => {
      mockPrismaService.user.findUniqueOrThrow = jest
        .fn()
        .mockResolvedValue(mockUser);
      const user = await userRepository.find({ id: mockUser.id });

      expect(user).toEqual(mockUser);
    });

    it('should return a NotFoundException for an invalid id', async () => {
      mockPrismaService.user.findUniqueOrThrow = jest
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(userRepository.find({ id: 'invalidId' })).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });

  describe('exists', () => {
    it('should return true when user exists', async () => {
      mockPrismaService.user.findUniqueOrThrow = jest
        .fn()
        .mockResolvedValue(mockUser);

      const exists = await userRepository.exists({ id: mockUser.id });

      expect(exists).toBe(true);
      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should return false when user does not exist', async () => {
      mockPrismaService.user.findUniqueOrThrow = jest
        .fn()
        .mockRejectedValue(new Error('User not found'));

      const exists = await userRepository.exists({ id: 'non-existent-id' });

      expect(exists).toBe(false);
      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });
  });

  describe('create', () => {
    it('should successfully create user', async () => {
      mockPrismaService.user.create = jest.fn().mockResolvedValue(mockUser);
      const user = await userRepository.create(mockCreateUser);

      expect(user).toEqual(mockUser);
    });

    it('should fail to create user with UNIQUE_CONSTRAINT code', async () => {
      const error = new Error() as any;
      error.code = ERROR_CODES.UNIQUE_CONSTRAINT;
      mockPrismaService.user.create = jest.fn().mockRejectedValue(error);

      await expect(userRepository.create(mockCreateUser)).rejects.toThrow(
        new HttpException('User exists', 409),
      );
    });

    it('should fail to create user with error code', async () => {
      const error = new Error('Error') as any;
      error.code = 404;
      mockPrismaService.user.create = jest.fn().mockRejectedValue(error);

      await expect(userRepository.create(mockCreateUser)).rejects.toThrow(
        new Error('Failed to create user'),
      );
    });
  });

  describe('error handling', () => {
    it('should handle unexpected database errors in find method', async () => {
      const databaseError = new Error('Database connection failed');
      mockPrismaService.user.findUniqueOrThrow = jest
        .fn()
        .mockRejectedValue(databaseError);

      await expect(userRepository.find({ id: mockUser.id })).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it('should handle unexpected database errors in create method', async () => {
      const databaseError = new Error('Database connection failed');
      mockPrismaService.user.create = jest
        .fn()
        .mockRejectedValue(databaseError);

      await expect(userRepository.create(mockCreateUser)).rejects.toThrow(
        new InternalServerErrorException('Failed to create user'),
      );
    });
  });
});
