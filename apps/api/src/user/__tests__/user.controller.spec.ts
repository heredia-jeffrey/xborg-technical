import { Test, TestingModule } from '@nestjs/testing';

import { UserController } from '../user.controller';
import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { mockSignupRequest, mockUser } from './mocks';

describe('UserController', () => {
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

  describe('getUser', () => {
    it('should successfully get a user by id', async () => {
      (mockUserRepository.find as jest.Mock).mockResolvedValue(mockUser);

      const user = await userController.getUser({ id: mockUser.id });

      expect(user).toEqual(mockUser);
      expect(mockUserRepository.find).toHaveBeenCalledWith({ id: mockUser.id });
    });

    it('should successfully get a user by address', async () => {
      (mockUserRepository.find as jest.Mock).mockResolvedValue(mockUser);

      const user = await userController.getUser({ address: mockUser.address });

      expect(user).toEqual(mockUser);
      expect(mockUserRepository.find).toHaveBeenCalledWith({ address: mockUser.address });
    });
  });

  describe('signup', () => {
    it('should successfully signup a user', async () => {
      (mockUserService.signup as jest.Mock).mockResolvedValue(mockUser);

      const result = await userController.signup(mockSignupRequest);

      expect(result).toEqual(mockUser);
      expect(mockUserService.signup).toHaveBeenCalledWith(mockSignupRequest);
    });
  });
}); 