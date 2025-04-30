import { Test, TestingModule } from '@nestjs/testing';
import { StubbedInstance, stubInterface } from 'ts-sinon';
import { ConflictException } from '@nestjs/common';

import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { mockSignupRequest, mockUser } from './mocks';

describe('UserService', () => {
  let userService: UserService;

  const mockUserRepository: StubbedInstance<UserRepository> =
    stubInterface<UserRepository>();

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

      const authResponse = await userService.signup(mockSignupRequest);

      expect(authResponse).toEqual(mockUser);
    });

    it('should detect existing user by address and throw ConflictException', async () => {
      // Setup exists to return true when checking for duplicate address
      mockUserRepository.exists.resolves(false); // Default behavior
      mockUserRepository.exists.withArgs({ address: mockSignupRequest.address }).resolves(true);
      
      // Expect the signup to throw a ConflictException
      await expect(userService.signup(mockSignupRequest)).rejects.toThrow(
        new ConflictException('User already exists')
      );
      
      // Verify the repository's exists method was called with the address
      expect(mockUserRepository.exists.calledWith({ address: mockSignupRequest.address })).toBeTruthy();
      
      // Verify create was never called
      expect(mockUserRepository.create.called).toBeFalsy();
    });
    
    it('should detect existing user by userName and throw ConflictException', async () => {
      // Reset exists behavior
      mockUserRepository.exists.reset();
      
      // Setup exists to return false for address check but true for username check
      const existsStub = mockUserRepository.exists;
      existsStub.withArgs({ address: mockSignupRequest.address }).resolves(false);
      existsStub.withArgs({ userName: mockSignupRequest.userName }).resolves(true);
      
      // Expect the signup to throw a ConflictException with correct message
      await expect(userService.signup(mockSignupRequest)).rejects.toThrow(
        new ConflictException('User already exists')
      );
      
      // Verify both checks were performed
      expect(existsStub.calledWith({ address: mockSignupRequest.address })).toBeTruthy();
      expect(existsStub.calledWith({ userName: mockSignupRequest.userName })).toBeTruthy();
      
      // Verify create was never called since user exists
      expect(mockUserRepository.create.called).toBeFalsy();
    });
  });
});
