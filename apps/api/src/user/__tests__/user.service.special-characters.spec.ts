import { Test, TestingModule } from '@nestjs/testing';
import { StubbedInstance, stubInterface } from 'ts-sinon';
import { BadRequestException } from '@nestjs/common';

import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { mockSignupRequest, mockUser } from './mocks';

describe('UserService - Special Characters', () => {
  let userService: UserService;

  const mockUserRepository: StubbedInstance<UserRepository> =
    stubInterface<UserRepository>();

  // Base valid signup request
  const validSignupRequest = {
    ...mockSignupRequest,
    email: 'valid@example.com',
  };

  beforeEach(async () => {
    // Reset all stubs before each test
    mockUserRepository.exists.reset();
    mockUserRepository.create.reset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        UserService,
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('username with special characters', () => {
    it('should accept usernames with hyphens and underscores', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const requestWithHyphenUsername = {
        ...validSignupRequest,
        userName: 'user-name_123',
      };

      await userService.signup(requestWithHyphenUsername);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.userName).toEqual('user-name_123');
    });

    it('should accept usernames with dots', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const requestWithDotUsername = {
        ...validSignupRequest,
        userName: 'user.name',
      };

      await userService.signup(requestWithDotUsername);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.userName).toEqual('user.name');
    });

    it('should accept usernames with numbers', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const requestWithNumberUsername = {
        ...validSignupRequest,
        userName: 'user123',
      };

      await userService.signup(requestWithNumberUsername);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.userName).toEqual('user123');
    });
  });

  describe('email with special characters', () => {
    it('should accept emails with plus sign', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const requestWithPlusEmail = {
        ...validSignupRequest,
        email: 'user+tag@example.com',
      };

      await userService.signup(requestWithPlusEmail);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.email).toEqual('user+tag@example.com');
    });

    it('should accept emails with dots in local part', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const requestWithDotEmail = {
        ...validSignupRequest,
        email: 'user.name@example.com',
      };

      await userService.signup(requestWithDotEmail);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.email).toEqual('user.name@example.com');
    });

    it('should accept emails with hyphens and underscores', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const requestWithSpecialCharsEmail = {
        ...validSignupRequest,
        email: 'user-name_123@example-site.com',
      };

      await userService.signup(requestWithSpecialCharsEmail);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.email).toEqual('user-name_123@example-site.com');
    });

    it('should accept emails with parentheses as they pass the current validation', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const requestWithParenthesesEmail = {
        ...validSignupRequest,
        email: 'user(name)@example.com',
      };

      await userService.signup(requestWithParenthesesEmail);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.email).toEqual('user(name)@example.com');
    });

    it('should reject emails without @ symbol', async () => {
      mockUserRepository.exists.resolves(false);

      const requestWithoutAtSymbol = {
        ...validSignupRequest,
        email: 'userexample.com',
      };

      await expect(userService.signup(requestWithoutAtSymbol)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserRepository.create.called).toBeFalsy();
    });

    it('should reject emails without domain part', async () => {
      mockUserRepository.exists.resolves(false);

      const requestWithoutDomain = {
        ...validSignupRequest,
        email: 'user@',
      };

      await expect(userService.signup(requestWithoutDomain)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserRepository.create.called).toBeFalsy();
    });

    it('should reject emails with spaces', async () => {
      mockUserRepository.exists.resolves(false);

      const requestWithSpacesEmail = {
        ...validSignupRequest,
        email: 'user name@example.com',
      };

      await expect(userService.signup(requestWithSpacesEmail)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserRepository.create.called).toBeFalsy();
    });
  });
}); 