import { Test, TestingModule } from '@nestjs/testing';
import { StubbedInstance, stubInterface } from 'ts-sinon';
import { ConflictException, BadRequestException } from '@nestjs/common';

import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { mockSignupRequest, mockUser } from './mocks';

describe('UserService', () => {
  let userService: UserService;

  const mockUserRepository: StubbedInstance<UserRepository> =
    stubInterface<UserRepository>();

  // Create a valid signup request with proper email
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

  describe('signup', () => {
    it('should successfully signup user', async () => {
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      const authResponse = await userService.signup(validSignupRequest);

      expect(authResponse).toEqual(mockUser);
    });

    it('should create a profile during user signup', async () => {
      // Setup repository behavior
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      // Call the signup method
      await userService.signup(validSignupRequest);

      // Verify create was called with the correct profile data
      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];

      // Check that profile creation is included in the create call
      expect(createArgs).toHaveProperty('profile.create');
      expect(createArgs.profile.create).toEqual({
        firstName: validSignupRequest.firstName,
        lastName: validSignupRequest.lastName,
      });
    });

    it('should handle profile creation with missing optional fields', async () => {
      // Setup repository behavior
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      // Create signup request without firstName and lastName
      const signupRequestWithoutProfileData = {
        address: 'test-address',
        userName: 'testuser',
        email: 'test@example.com',
      };

      // Call the signup method
      await userService.signup(signupRequestWithoutProfileData);

      // Verify create was called with the correct profile data
      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];

      // Check that profile creation still occurs but with undefined values
      expect(createArgs).toHaveProperty('profile.create');
      expect(createArgs.profile.create).toEqual({
        firstName: undefined,
        lastName: undefined,
      });
    });

    it('should validate email format if provided', async () => {
      // Setup repository behavior
      mockUserRepository.exists.resolves(false);

      // Create signup request with invalid email
      const invalidEmailRequest = {
        ...mockSignupRequest,
        email: 'invalid-email',
      };

      // Call the signup method and expect it to throw
      await expect(userService.signup(invalidEmailRequest)).rejects.toThrow(
        BadRequestException,
      );

      // Verify repository was never called
      expect(mockUserRepository.create.called).toBeFalsy();
    });

    it('should accept a valid email format', async () => {
      // Setup repository behavior
      mockUserRepository.exists.resolves(false);
      mockUserRepository.create.resolves(mockUser);

      // Create signup request with valid email
      const validEmailRequest = {
        ...mockSignupRequest,
        email: 'valid.email@example.com',
      };

      // Call the signup method
      await userService.signup(validEmailRequest);

      // Verify create was called with the correct email
      expect(mockUserRepository.create.calledOnce).toBeTruthy();
      const createArgs = mockUserRepository.create.firstCall.args[0];
      expect(createArgs.email).toEqual('valid.email@example.com');
    });

    it('should handle malformed request with missing required fields', async () => {
      // Setup repository behavior
      mockUserRepository.exists.resolves(false);

      // Test without address (required field)
      const requestWithoutAddress = {
        userName: mockSignupRequest.userName,
      };

      // Call the signup method and expect it to throw
      await expect(
        userService.signup(requestWithoutAddress as any),
      ).rejects.toThrow(BadRequestException);

      // Test without userName (required field)
      const requestWithoutUserName = {
        address: mockSignupRequest.address,
      };

      // Call the signup method and expect it to throw
      await expect(
        userService.signup(requestWithoutUserName as any),
      ).rejects.toThrow(BadRequestException);

      // Verify create was never called
      expect(mockUserRepository.create.called).toBeFalsy();
    });

    it('should detect existing user by address and throw ConflictException', async () => {
      // Setup exists to return true when checking for duplicate address
      mockUserRepository.exists.resolves(false); // Default behavior
      mockUserRepository.exists
        .withArgs({ address: validSignupRequest.address })
        .resolves(true);

      // Expect the signup to throw a ConflictException
      await expect(userService.signup(validSignupRequest)).rejects.toThrow(
        new ConflictException('User already exists'),
      );

      // Verify the repository's exists method was called with the address
      expect(
        mockUserRepository.exists.calledWith({
          address: validSignupRequest.address,
        }),
      ).toBeTruthy();

      // Verify create was never called
      expect(mockUserRepository.create.called).toBeFalsy();
    });

    it('should detect existing user by userName and throw ConflictException', async () => {
      // Reset exists behavior
      mockUserRepository.exists.reset();

      // Setup exists to return false for address check but true for username check
      const existsStub = mockUserRepository.exists;
      existsStub
        .withArgs({ address: validSignupRequest.address })
        .resolves(false);
      existsStub
        .withArgs({ userName: validSignupRequest.userName })
        .resolves(true);

      // Expect the signup to throw a ConflictException with correct message
      await expect(userService.signup(validSignupRequest)).rejects.toThrow(
        new ConflictException('User already exists'),
      );

      // Verify both checks were performed
      expect(
        existsStub.calledWith({ address: validSignupRequest.address }),
      ).toBeTruthy();
      expect(
        existsStub.calledWith({ userName: validSignupRequest.userName }),
      ).toBeTruthy();

      // Verify create was never called since user exists
      expect(mockUserRepository.create.called).toBeFalsy();
    });
  });
});
