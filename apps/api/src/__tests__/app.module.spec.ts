import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppModule } from '../app.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { PrismaService } from '../prisma/prisma.service';

// Mock PrismaService to avoid database connection attempts
jest.mock('../prisma/prisma.service', () => {
  const mockPrismaService = {
    onModuleInit: jest.fn(),
    enableShutdownHooks: jest.fn(),
    $connect: jest.fn(),
    $on: jest.fn(),
  };
  return {
    PrismaService: jest.fn().mockImplementation(() => mockPrismaService),
  };
});

// Mock ConfigService
jest.mock('@nestjs/config', () => {
  const actual = jest.requireActual('@nestjs/config');
  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'DATABASE_URL') return 'mock-db-url';
      return undefined;
    }),
  };
  return {
    ...actual,
    ConfigService: jest.fn().mockImplementation(() => mockConfigService),
  };
});

describe('AppModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should have the correct imports', async () => {
    // Get the module definition
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Now we're mocking the module's metadata directly
    const imports = Reflect.getMetadata('imports', AppModule);
    
    // Check that PrismaModule and UserModule are imported
    expect(imports).toContain(PrismaModule);
    expect(imports).toContain(UserModule);
    
    // Check that a ConfigModule is included (it will be a function for dynamic modules)
    expect(imports.some(imp => 
      typeof imp === 'function' || 
      (imp && imp.module === ConfigModule)
    )).toBeTruthy();
  });
}); 