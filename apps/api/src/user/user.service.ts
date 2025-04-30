import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';

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

    // Validate required fields
    if (!address) {
      throw new BadRequestException('Address is required');
    }

    if (!userName) {
      throw new BadRequestException('Username is required');
    }

    // Validate email format if provided
    if (email && !this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
