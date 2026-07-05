import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { Organization } from '../common/entities/organization.entity';
import { User } from '../common/entities/user.entity';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let orgRepo: jest.Mocked<Repository<Organization>>;
  let userRepo: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockJwtToken = 'mock-jwt-token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue(mockJwtToken),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    orgRepo = module.get(getRepositoryToken(Organization));
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── register ─────────────────────────────────────────────────────

  describe('register', () => {
    const registerDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
      organizationName: 'My Org',
    };

    const mockOrg = { id: 1, name: 'My Org', slug: 'my-org' } as Organization;
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: 'admin',
      organizationId: 1,
    } as User;

    it('should register a new user and organization successfully', async () => {
      userRepo.findOne.mockResolvedValue(null); // No existing user
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      orgRepo.create.mockReturnValue(mockOrg);
      orgRepo.save.mockResolvedValue(mockOrg);
      userRepo.create.mockReturnValue(mockUser);
      userRepo.save.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result.token).toBe(mockJwtToken);
      expect(result.user.email).toBe('john@example.com');
      expect(result.user.role).toBe('admin');
      expect(result.user.organizationId).toBe(1);
      expect(orgRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My Org', slug: 'my-org' }),
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 1, email: 'john@example.com', organizationId: 1 }),
      );
    });

    it('should generate correct organization slug', async () => {
      userRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      orgRepo.create.mockImplementation((data: any) => ({ ...data, id: 1 }));
      orgRepo.save.mockImplementation((data: any) => Promise.resolve({ ...data, id: 1 }));
      userRepo.create.mockReturnValue(mockUser);
      userRepo.save.mockResolvedValue(mockUser);

      await service.register({ ...registerDto, organizationName: '  My   Awesome Org!  ' });

      // Slug should be 'my-awesome-org'
      expect(orgRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'my-awesome-org' }),
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(orgRepo.save).not.toHaveBeenCalled();
    });

    it('should hash the password with bcrypt', async () => {
      userRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      orgRepo.create.mockReturnValue(mockOrg);
      orgRepo.save.mockResolvedValue(mockOrg);
      userRepo.create.mockReturnValue(mockUser);
      userRepo.save.mockResolvedValue(mockUser);

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);
      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed-password' }),
      );
    });
  });

  // ─── login ────────────────────────────────────────────────────────

  describe('login', () => {
    const loginDto = { email: 'john@example.com', password: 'secret123' };

    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: 'admin',
      organizationId: 1,
    } as User;

    it('should login successfully with valid credentials', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.token).toBe(mockJwtToken);
      expect(result.user.email).toBe('john@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('secret123', 'hashed-password');
    });

    it('should select password field for comparison', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(loginDto);

      expect(userRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'john@example.com' },
          select: expect.objectContaining({ password: true }),
        }),
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── getProfile ──────────────────────────────────────────────────

  describe('getProfile', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: 'admin',
      organizationId: 1,
      organization: { id: 1, name: 'My Org', slug: 'my-org' },
    } as User;

    it('should return user profile without password', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(result).toBeDefined();
      expect((result as any).password).toBeUndefined();
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('should include organization relation', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      await service.getProfile(1);

      expect(userRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          relations: { organization: true },
        }),
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(UnauthorizedException);
    });
  });
});
