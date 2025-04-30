import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SignUpCall, SignUpDTO, GetUserCall, GetUserDTO } from 'lib-server';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from '../user/user.repository';
import { UserService } from '../user/user.service';
import { UserController } from '../user/user.controller';
import { User } from '../prisma/types/user.types';

// Mock data
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

const mockSignUpData: SignUpDTO = {
  address: '0x123456789abcdef',
  userName: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
};

// Create mock of PrismaService
const mockPrismaService = {
  user: {
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
  },
  $connect: jest.fn(),
  $on: jest.fn(),
};

describe('User API Integration Tests', () => {
  let app: INestMicroservice;
  let userController: UserController;
  let userService: UserService;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            exists: jest.fn()
          }
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    userController = moduleRef.get<UserController>(UserController);
    userService = moduleRef.get<UserService>(UserService);
    userRepository = moduleRef.get<UserRepository>(UserRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('getUser', () => {
    it('should retrieve a user by id', async () => {
      // Arrange
      const getUserDTO: GetUserDTO = { id: '1' };
      jest.spyOn(userRepository, 'find').mockResolvedValue(mockUser);

      // Act
      const result = await userController.getUser(getUserDTO);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.find).toHaveBeenCalledWith({ id: '1', address: undefined });
    });

    it('should retrieve a user by address', async () => {
      // Arrange
      const getUserDTO: GetUserDTO = { address: '0x123456789abcdef' };
      jest.spyOn(userRepository, 'find').mockResolvedValue(mockUser);

      // Act
      const result = await userController.getUser(getUserDTO);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.find).toHaveBeenCalledWith({ id: undefined, address: '0x123456789abcdef' });
    });

    it('should throw NotFoundException when user is not found', async () => {
      // Arrange
      const getUserDTO: GetUserDTO = { id: 'nonexistent' };
      jest.spyOn(userRepository, 'find').mockRejectedValue(new Error('User not found'));

      // Act & Assert
      await expect(userController.getUser(getUserDTO)).rejects.toThrow();
    });
  });

  describe('signup', () => {
    it('should successfully create a new user', async () => {
      // Arrange
      jest.spyOn(userRepository, 'create').mockResolvedValue(mockUser);
      
      // Act
      const result = await userController.signup(mockSignUpData);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should call repository.create with correct data', async () => {
      // Arrange
      jest.spyOn(userRepository, 'create').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'exists').mockResolvedValue(false);
      
      // Act
      const result = await userService.signup(mockSignUpData);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.create).toHaveBeenCalledWith({
        address: mockSignUpData.address,
        userName: mockSignUpData.userName,
        email: mockSignUpData.email,
        profile: {
          create: {
            firstName: mockSignUpData.firstName,
            lastName: mockSignUpData.lastName,
          }
        }
      });
    });

    it('should throw an error when a duplicate user is created', async () => {
      // Arrange
      jest.spyOn(userRepository, 'exists').mockResolvedValue(true);
      
      // Act & Assert
      await expect(userService.signup(mockSignUpData)).rejects.toThrow();
    });
  });
}); 