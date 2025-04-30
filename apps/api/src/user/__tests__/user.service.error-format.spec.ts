import { Test, TestingModule } from '@nestjs/testing';
import { 
  BadRequestException, 
  ConflictException, 
  HttpException,
  InternalServerErrorException
} from '@nestjs/common';

import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';
import { mockSignupRequest } from './mocks';

describe('UserService Error Response Format Tests', () => {
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

  describe('Service Error Response Format Tests', () => {
    it('should include validation details in BadRequestException for missing address', async () => {
      const invalidRequest = { ...mockSignupRequest, address: undefined };
      
      try {
        await userService.signup(invalidRequest as any);
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as BadRequestException;
        expect(httpError).toBeInstanceOf(BadRequestException);
        expect(httpError.getStatus()).toBe(400);
        
        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 400);
        expect(response).toHaveProperty('message', 'Address is required');
        expect(response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should include validation details in BadRequestException for missing username', async () => {
      const invalidRequest = { ...mockSignupRequest, address: 'test-address', userName: undefined };
      
      try {
        await userService.signup(invalidRequest as any);
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as BadRequestException;
        expect(httpError).toBeInstanceOf(BadRequestException);
        expect(httpError.getStatus()).toBe(400);
        
        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 400);
        expect(response).toHaveProperty('message', 'Username is required');
        expect(response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should include validation details in BadRequestException for invalid email format', async () => {
      const invalidEmailRequest = { 
        ...mockSignupRequest, 
        address: 'test-address', 
        userName: 'test-user',
        email: 'invalid-email' 
      };
      
      try {
        await userService.signup(invalidEmailRequest);
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as BadRequestException;
        expect(httpError).toBeInstanceOf(BadRequestException);
        expect(httpError.getStatus()).toBe(400);
        
        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 400);
        expect(response).toHaveProperty('message', 'Invalid email format');
        expect(response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should include proper error details in ConflictException for existing user', async () => {
      (mockUserRepository.exists as jest.Mock).mockResolvedValue(true);
      
      try {
        await userService.signup({
          ...mockSignupRequest,
          address: 'existing-address',
          userName: 'existing-user',
          email: 'valid@example.com'
        });
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as ConflictException;
        expect(httpError).toBeInstanceOf(ConflictException);
        expect(httpError.getStatus()).toBe(409);
        
        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 409);
        expect(response).toHaveProperty('message', 'User already exists');
        expect(response).toHaveProperty('error', 'Conflict');
      }
    });

    it('should properly format error response when repository throws errors', async () => {
      (mockUserRepository.exists as jest.Mock).mockResolvedValue(false);
      (mockUserRepository.create as jest.Mock).mockRejectedValue(
        new InternalServerErrorException('Database operation failed')
      );
      
      try {
        await userService.signup({
          ...mockSignupRequest,
          address: 'test-address',
          userName: 'test-user',
          email: 'valid@example.com'
        });
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as InternalServerErrorException;
        expect(httpError).toBeInstanceOf(InternalServerErrorException);
        expect(httpError.getStatus()).toBe(500);
        
        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 500);
        expect(response).toHaveProperty('message', 'Database operation failed');
        expect(response).toHaveProperty('error', 'Internal Server Error');
      }
    });

    it('should maintain error response format for custom error messages', async () => {
      const customErrorMessage = {
        statusCode: 400,
        message: ['Field 1 is invalid', 'Field 2 is required'],
        error: 'Validation Error'
      };
      
      (mockUserRepository.exists as jest.Mock).mockResolvedValue(false);
      (mockUserRepository.create as jest.Mock).mockRejectedValue(
        new BadRequestException(customErrorMessage)
      );
      
      try {
        await userService.signup({
          ...mockSignupRequest,
          address: 'test-address',
          userName: 'test-user',
          email: 'valid@example.com'
        });
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as BadRequestException;
        expect(httpError).toBeInstanceOf(BadRequestException);
        expect(httpError.getStatus()).toBe(400);
        
        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 400);
        expect(response).toHaveProperty('message');
        expect(response.message).toEqual(customErrorMessage.message);
        expect(response).toHaveProperty('error');
      }
    });
  });
}); 