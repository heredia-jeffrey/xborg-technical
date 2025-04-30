import { Injectable, Logger, ConflictException } from '@nestjs/common';

import { SignUpDTO } from 'lib-server';

import { UserRepository } from './user.repository';
import { User } from '../prisma/types/user.types';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async signup({
    address,
    userName,
    email,
    firstName,
    lastName,
  }: SignUpDTO): Promise<User> {
    this.logger.log(`Registering new user with address: ${address}`);

    // Check if user already exists by address or username
    const userExists =
      (await this.userRepository.exists({ address })) ||
      (await this.userRepository.exists({ userName }));

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    return this.userRepository.create({
      address,
      userName,
      email,
      profile: {
        create: {
          firstName,
          lastName,
        },
      },
    });
  }
}
