import { Test, TestingModule } from '@nestjs/testing';
import { StubbedInstance, stubInterface } from 'ts-sinon';
import { ConflictException, BadRequestException } from '@nestjs/common';

import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { mockSignupRequest, mockUser } from './mocks';

describe('UserService - Edge Cases', () => {
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

  describe('boundary conditions', () => {
    it('should accept very long usernames', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      // Create a very long username (64 characters)
      const longUsername = 'a'.repeat(64);
      const requestWithLongUsername = {
        ...validSignupRequest,
        userName: longUsername,
      };

      await userService.signup(requestWithLongUsername);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.userName).toEqual(longUsername);
      expect(createArgs.userName.length).toEqual(64);
    });

    it('should accept very long email addresses', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      // Long local part (64 characters) + @ + domain (255 characters)
      const longLocalPart = 'a'.repeat(64);
      const longDomain = 'd'.repeat(63) + '.com'; // Domain parts limited to 63, with dots
      const longEmail = `${longLocalPart}@${longDomain}`;
      
      const requestWithLongEmail = {
        ...validSignupRequest,
        email: longEmail,
      };

      await userService.signup(requestWithLongEmail);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.email).toEqual(longEmail);
    });

    it('should accept email with many dots in domain', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const multiDomainEmail = 'user@sub1.sub2.sub3.sub4.example.com';
      const requestWithMultiDomainEmail = {
        ...validSignupRequest,
        email: multiDomainEmail,
      };

      await userService.signup(requestWithMultiDomainEmail);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.email).toEqual(multiDomainEmail);
    });

    it('should handle very long names', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      // Long first and last names (50 characters each)
      const longFirstName = 'First'.repeat(10);
      const longLastName = 'Last'.repeat(10);
      
      const requestWithLongNames = {
        ...validSignupRequest,
        firstName: longFirstName,
        lastName: longLastName,
      };

      await userService.signup(requestWithLongNames);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.profile.create.firstName).toEqual(longFirstName);
      expect(createArgs.profile.create.lastName).toEqual(longLastName);
    });
  });

  describe('empty and null values', () => {
    it('should handle empty optional fields', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const requestWithEmptyOptionalFields = {
        address: 'test-address',
        userName: 'testuser',
        email: '',
        firstName: '',
        lastName: '',
      };

      await userService.signup(requestWithEmptyOptionalFields);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.email).toEqual('');
      expect(createArgs.profile.create.firstName).toEqual('');
      expect(createArgs.profile.create.lastName).toEqual('');
    });

    it('should handle null optional fields', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const requestWithNullOptionalFields = {
        address: 'test-address',
        userName: 'testuser',
        email: null,
        firstName: null,
        lastName: null,
      };

      await userService.signup(requestWithNullOptionalFields);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.email).toBeNull();
      expect(createArgs.profile.create.firstName).toBeNull();
      expect(createArgs.profile.create.lastName).toBeNull();
    });

    it('should validate empty email if provided (empty string)', async () => {
      mockUserRepository.exists.resolves(false);

      const requestWithEmptyEmail = {
        ...validSignupRequest,
        email: '',
      };

      // Empty string email should pass validation since it's treated as not provided
      await userService.signup(requestWithEmptyEmail);
      
      expect(mockUserRepository.create.calledOnce).toBeTruthy();
    });
  });

  describe('unicode characters', () => {
    it('should accept unicode characters in names', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const requestWithUnicodeNames = {
        ...validSignupRequest,
        firstName: 'José Ñandú',
        lastName: '张三 李四',
      };

      await userService.signup(requestWithUnicodeNames);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.profile.create.firstName).toEqual('José Ñandú');
      expect(createArgs.profile.create.lastName).toEqual('张三 李四');
    });

    it('should accept unicode in username if current validation allows', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const requestWithUnicodeUsername = {
        ...validSignupRequest,
        userName: 'user名字',
      };

      await userService.signup(requestWithUnicodeUsername);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.userName).toEqual('user名字');
    });
    
    it('should accept IDN email domains (Punycode)', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const requestWithIDNEmail = {
        ...validSignupRequest,
        email: 'user@例子.测试',
      };

      await userService.signup(requestWithIDNEmail);

      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.email).toEqual('user@例子.测试');
    });
  });
}); 