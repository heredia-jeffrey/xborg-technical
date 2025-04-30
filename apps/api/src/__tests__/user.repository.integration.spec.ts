import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from '../user/user.repository';
import { User } from '../prisma/types/user.types';
import { ERROR_CODES } from '../prisma/constants';

// Mock user data
const mockUser: User = {
  id: '1',
  address: '0x123456789abcdef',
  userName: 'testuser',
  email: 'test@example.com',
  profile: {
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    location: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock PrismaService
const mockPrismaService = {
  user: {
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
  },
};

describe('UserRepository Integration Tests', () => {
  let userRepository: UserRepository;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    userRepository = moduleRef.get<UserRepository>(UserRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('find', () => {
    it('should find a user by id successfully', async () => {
      // Arrange
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(mockUser);

      // Act
      const result = await userRepository.find({ id: '1' });

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '1' },
        select: expect.any(Object),
      });
    });

    it('should find a user by address successfully', async () => {
      // Arrange
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(mockUser);

      // Act
      const result = await userRepository.find({
        address: '0x123456789abcdef',
      });

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { address: '0x123456789abcdef' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      // Arrange
      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(
        new Error('User not found'),
      );

      // Act & Assert
      await expect(userRepository.find({ id: 'nonexistent' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      // Arrange
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      const userData = {
        address: '0x123456789abcdef',
        userName: 'testuser',
        email: 'test@example.com',
        profile: {
          create: {
            firstName: 'Test',
            lastName: 'User',
          },
        },
      };

      // Act
      const result = await userRepository.create(userData);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: userData,
        select: expect.any(Object),
      });
    });

    it('should throw HttpException with 409 when user already exists', async () => {
      // Arrange
      const uniqueConstraintError = {
        code: ERROR_CODES.UNIQUE_CONSTRAINT,
        message: 'Unique constraint failed',
      };
      mockPrismaService.user.create.mockRejectedValue(uniqueConstraintError);

      // Act & Assert
      await expect(
        userRepository.create({
          address: '0x123456789abcdef',
          userName: 'testuser',
          email: 'test@example.com',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      // Arrange
      mockPrismaService.user.create.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        userRepository.create({
          address: '0x123456789abcdef',
          userName: 'testuser',
          email: 'test@example.com',
        }),
      ).rejects.toThrow('Failed to create user');
    });
  });
});
