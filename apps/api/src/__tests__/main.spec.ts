import { INestMicroservice } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { StubbedInstance, stubInterface } from 'ts-sinon';

import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

// Mock modules
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    createMicroservice: jest.fn(),
  },
}));

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    enableShutdownHooks: jest.fn(),
  })),
}));

// Original bootstrap function for reference
// async function bootstrap() {
//   const app: INestMicroservice =
//     await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
//       transport: Transport.RMQ,
//       options: {
//         urls: ['amqp://xborg:password@localhost:36010'],
//         queue: 'api_queue',
//         queueOptions: {
//           durable: true,
//         },
//         noAck: true,
//       },
//     });

//   const prismaService = app.get(PrismaService);
//   await prismaService.enableShutdownHooks(app);

//   await app.listen();
//   console.log('API Microservice is listening');
// }

describe('Bootstrap', () => {
  let mockApp: StubbedInstance<INestMicroservice>;
  let mockPrismaService: StubbedInstance<PrismaService>;
  
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock app and prisma service using ts-sinon
    mockApp = stubInterface<INestMicroservice>();
    mockPrismaService = stubInterface<PrismaService>();

    // Setup app.get to return the mock PrismaService
    mockApp.get.returns(mockPrismaService);

    // Setup NestFactory.createMicroservice mock to return our mock app
    (NestFactory.createMicroservice as jest.Mock).mockResolvedValue(mockApp);
  });

  it('should bootstrap the application correctly', async () => {
    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // We need to isolate the module to prevent circular dependencies
    jest.isolateModules(() => {
      // Import the bootstrap function
      require('../main');
    });

    // Wait for any pending promises to resolve
    await new Promise(process.nextTick);

    // Check that NestFactory.createMicroservice was called
    expect(NestFactory.createMicroservice).toHaveBeenCalled();
    
    // Check that createMicroservice was called with correct parameters
    const createMicroserviceCalls = (NestFactory.createMicroservice as jest.Mock).mock.calls;
    expect(createMicroserviceCalls.length).toBe(1);
    
    // Verify the options object structure without directly comparing the module
    const options = createMicroserviceCalls[0][1];
    expect(options.transport).toBe(Transport.RMQ);
    expect(options.options.queue).toBe('api_queue');
    expect(options.options.urls).toContain('amqp://xborg:password@localhost:36010');
    expect(options.options.queueOptions.durable).toBe(true);
    expect(options.options.noAck).toBe(true);

    // Wait for all promises to resolve
    await new Promise(resolve => setTimeout(resolve, 100));

    // Assert enableShutdownHooks was called
    expect(mockPrismaService.enableShutdownHooks.called).toBeTruthy();

    // Assert app.listen was called
    expect(mockApp.listen.called).toBeTruthy();

    // Restore console.log
    consoleSpy.mockRestore();
  });
}); 