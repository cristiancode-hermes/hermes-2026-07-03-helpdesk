import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockToken = 'jwt-token';
  const mockUser = { id: 1, name: 'Test', email: 'test@test.com', role: 'admin', organizationId: 1 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            getProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const dto = { name: 'Test', email: 'test@test.com', password: 'pass123', organizationName: 'Org' };
      authService.register.mockResolvedValue({ token: mockToken, user: mockUser });

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result.token).toBe(mockToken);
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const dto = { email: 'test@test.com', password: 'pass123' };
      authService.login.mockResolvedValue({ token: mockToken, user: mockUser });

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result.token).toBe(mockToken);
    });
  });

  describe('getProfile', () => {
    it('should call authService.getProfile with user id', async () => {
      const user = { id: 1, name: 'Test', email: 'test@test.com', role: 'admin', organizationId: 1 } as any;
      authService.getProfile.mockResolvedValue(mockUser as any);

      const result = await controller.getProfile(user);

      expect(authService.getProfile).toHaveBeenCalledWith(1);
    });
  });
});
