import { Test, TestingModule } from '@nestjs/testing';
import { 
  BadRequestException, 
  ConflictException, 
  HttpException,
  InternalServerErrorException, 
  NotFoundException 
} from '@nestjs/common';

import { UserController } from '../user.controller';
import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { mockSignupRequest, mockUser } from './mocks';
import { PrismaService } from '../../prisma/prisma.service';
import { ERROR_CODES } from '../../prisma/constants';

describe('User API Error Handling', () => {
  describe('UserController Error Handling', () => {
    let userController: UserController;
    let mockUserService: Partial<UserService>;
    let mockUserRepository: Partial<UserRepository>;

    beforeEach(async () => {
      // Create mock implementations with Jest
      mockUserService = {
        signup: jest.fn(),
      };

      mockUserRepository = {
        find: jest.fn(),
        exists: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [UserController],
        providers: [
          {
            provide: UserService,
            useValue: mockUserService,
          },
          {
            provide: UserRepository,
            useValue: mockUserRepository,
          },
        ],
      }).compile();

      userController = module.get<UserController>(UserController);
    });

    describe('getUser endpoint errors', () => {
      it('should handle NotFoundException when user is not found', async () => {
        (mockUserRepository.find as jest.Mock).mockRejectedValue(new NotFoundException('User not found'));

        await expect(userController.getUser({ id: 'invalid-id' })).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should handle InternalServerError when database fails unexpectedly', async () => {
        (mockUserRepository.find as jest.Mock).mockRejectedValue(new InternalServerErrorException('Database connection failed'));

        await expect(userController.getUser({ id: mockUser.id })).rejects.toThrow(
          InternalServerErrorException,
        );
      });

      it('should accept a getUser request with empty parameters', async () => {
        // In the actual implementation, this does not throw but gets handled by the service
        // So we'll check that it passes through to the repository
        (mockUserRepository.find as jest.Mock).mockResolvedValue(undefined);
        
        await userController.getUser({} as any);
        
        expect(mockUserRepository.find).toHaveBeenCalled();
      });
    });

    describe('signup endpoint errors', () => {
      it('should handle ConflictException when user already exists', async () => {
        (mockUserService.signup as jest.Mock).mockRejectedValue(new ConflictException('User already exists'));

        await expect(userController.signup(mockSignupRequest)).rejects.toThrow(
          ConflictException,
        );
      });

      it('should handle BadRequestException with invalid input', async () => {
        (mockUserService.signup as jest.Mock).mockRejectedValue(new BadRequestException('Invalid input data'));

        await expect(userController.signup({} as any)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should handle InternalServerError during signup', async () => {
        (mockUserService.signup as jest.Mock).mockRejectedValue(new InternalServerErrorException('Failed to create user'));

        await expect(userController.signup(mockSignupRequest)).rejects.toThrow(
          InternalServerErrorException,
        );
      });
    });
  });

  describe('UserService Error Handling', () => {
    let userService: UserService;
    let mockUserRepository: Partial<UserRepository>;

    beforeEach(async () => {
      mockUserRepository = {
        exists: jest.fn(),
        create: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserService,
          {
            provide: UserRepository,
            useValue: mockUserRepository,
          },
        ],
      }).compile();

      userService = module.get<UserService>(UserService);
    });

    describe('signup method errors', () => {
      it('should handle empty request body', async () => {
        await expect(userService.signup({} as any)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should handle null values in required fields', async () => {
        const invalidRequest = { ...mockSignupRequest, address: null, userName: null };
        
        await expect(userService.signup(invalidRequest as any)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should reject invalid email formats', async () => {
        // Test just one invalid email as a representative test
        // Verifies the email validation logic
        const invalidEmailRequest = { 
          ...mockSignupRequest, 
          address: 'test-address', 
          userName: 'test-user',
          email: 'not-a-valid-email' 
        };
        
        (mockUserRepository.exists as jest.Mock).mockResolvedValue(false);
        
        await expect(userService.signup(invalidEmailRequest)).rejects.toThrow(
          BadRequestException
        );
      });

      it('should handle repository internal errors during user creation', async () => {
        (mockUserRepository.exists as jest.Mock).mockResolvedValue(false);
        (mockUserRepository.create as jest.Mock).mockRejectedValue(
          new InternalServerErrorException('Database error')
        );

        const validRequest = {
          ...mockSignupRequest,
          email: 'valid@example.com',
        };

        await expect(userService.signup(validRequest)).rejects.toThrow(
          InternalServerErrorException
        );
      });

      it('should handle concurrent user creation attempts', async () => {
        // First check passes, but second one (concurrent check) fails
        (mockUserRepository.exists as jest.Mock).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
        
        await expect(userService.signup({
          ...mockSignupRequest,
          email: 'valid@example.com',
        })).rejects.toThrow(
          ConflictException
        );
      });
    });
  });
}); 