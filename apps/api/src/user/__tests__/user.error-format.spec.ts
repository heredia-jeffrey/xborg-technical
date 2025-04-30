import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { UserController } from '../user.controller';
import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { mockSignupRequest, mockUser } from './mocks';

describe('User API Error Response Format Tests', () => {
  let userController: UserController;
  let mockUserService: Partial<UserService>;
  let mockUserRepository: Partial<UserRepository>;

  beforeEach(async () => {
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

  describe('Error Response Format Tests', () => {
    it('should include status code in BadRequestException response', async () => {
      const errorMessage = 'Invalid input data';
      const exception = new BadRequestException(errorMessage);
      (mockUserService.signup as jest.Mock).mockRejectedValue(exception);

      try {
        await userController.signup(mockSignupRequest);
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as HttpException;
        expect(httpError).toBeInstanceOf(HttpException);
        expect(httpError.getStatus()).toBe(400);
        expect(httpError.message).toBe(errorMessage);

        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 400);
        expect(response).toHaveProperty('message', errorMessage);
        expect(response).toHaveProperty('error', 'Bad Request');
      }
    });

    it('should include status code in ConflictException response', async () => {
      const errorMessage = 'User already exists';
      const exception = new ConflictException(errorMessage);
      (mockUserService.signup as jest.Mock).mockRejectedValue(exception);

      try {
        await userController.signup(mockSignupRequest);
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as HttpException;
        expect(httpError).toBeInstanceOf(HttpException);
        expect(httpError.getStatus()).toBe(409);
        expect(httpError.message).toBe(errorMessage);

        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 409);
        expect(response).toHaveProperty('message', errorMessage);
        expect(response).toHaveProperty('error', 'Conflict');
      }
    });

    it('should include status code in NotFoundException response', async () => {
      const errorMessage = 'User not found';
      const exception = new NotFoundException(errorMessage);
      (mockUserRepository.find as jest.Mock).mockRejectedValue(exception);

      try {
        await userController.getUser({ id: 'invalid-id' });
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as HttpException;
        expect(httpError).toBeInstanceOf(HttpException);
        expect(httpError.getStatus()).toBe(404);
        expect(httpError.message).toBe(errorMessage);

        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 404);
        expect(response).toHaveProperty('message', errorMessage);
        expect(response).toHaveProperty('error', 'Not Found');
      }
    });

    it('should include status code in InternalServerErrorException response', async () => {
      const errorMessage = 'Database connection failed';
      const exception = new InternalServerErrorException(errorMessage);
      (mockUserRepository.find as jest.Mock).mockRejectedValue(exception);

      try {
        await userController.getUser({ id: mockUser.id });
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as HttpException;
        expect(httpError).toBeInstanceOf(HttpException);
        expect(httpError.getStatus()).toBe(500);
        expect(httpError.message).toBe(errorMessage);

        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 500);
        expect(response).toHaveProperty('message', errorMessage);
        expect(response).toHaveProperty('error', 'Internal Server Error');
      }
    });

    it('should include status code in ServiceUnavailableException response', async () => {
      const errorMessage = 'Service is temporarily unavailable';
      const exception = new ServiceUnavailableException(errorMessage);
      (mockUserRepository.find as jest.Mock).mockRejectedValue(exception);

      try {
        await userController.getUser({ id: mockUser.id });
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as HttpException;
        expect(httpError).toBeInstanceOf(HttpException);
        expect(httpError.getStatus()).toBe(503);
        expect(httpError.message).toBe(errorMessage);

        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 503);
        expect(response).toHaveProperty('message', errorMessage);
        expect(response).toHaveProperty('error', 'Service Unavailable');
      }
    });

    it('should handle custom error properties in exceptions', async () => {
      const errorMessage = 'Validation failed';
      const validationErrors = ['Field1 is required', 'Field2 is invalid'];

      const exception = new BadRequestException({
        message: errorMessage,
        errors: validationErrors,
      });

      (mockUserService.signup as jest.Mock).mockRejectedValue(exception);

      try {
        await userController.signup(mockSignupRequest);
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as HttpException;
        expect(httpError).toBeInstanceOf(HttpException);
        expect(httpError.getStatus()).toBe(400);

        const response = httpError.getResponse() as any;
        expect(response).toEqual({
          message: errorMessage,
          errors: validationErrors,
        });
        expect(response.message).toBe(errorMessage);
        expect(response.errors).toEqual(validationErrors);
      }
    });

    it('should generate a proper error response for array of error messages', async () => {
      const errorMessages = ['Username is required', 'Email format is invalid'];
      const exception = new BadRequestException(errorMessages);

      (mockUserService.signup as jest.Mock).mockRejectedValue(exception);

      try {
        await userController.signup(mockSignupRequest);
        fail('Expected error was not thrown');
      } catch (error) {
        const httpError = error as HttpException;
        expect(httpError).toBeInstanceOf(HttpException);
        expect(httpError.getStatus()).toBe(400);

        const response = httpError.getResponse() as Record<string, any>;
        expect(response).toHaveProperty('statusCode', 400);
        expect(response).toHaveProperty('message');
        expect(response.message).toEqual(errorMessages);
      }
    });
  });
});
