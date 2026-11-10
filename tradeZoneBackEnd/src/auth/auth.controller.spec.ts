import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // ignora autenticação real
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================================================
  // 🧾 TESTES DO REGISTER
  // ==================================================
  describe('register', () => {
    it('✅ deve registrar um usuário com sucesso', async () => {
      const dto: RegisterDto = {
          name: 'Kaue',
          email: 'kaue@email.com',
          password: '123456',
          date_of_birth: '"1990-11-25"',
          phone: '11954866282',
          accepted_terms: true
      };

      const result = { token: 'fake-jwt-token', userId: 1 };
      mockAuthService.register.mockResolvedValue(result);

      const response = await controller.register(dto);

      expect(response).toEqual(result);
      expect(service.register).toHaveBeenCalledWith(dto);
      expect(service.register).toHaveBeenCalledTimes(1);
    });

    it('🚫 deve lançar erro se e-mail já estiver cadastrado', async () => {
      const dto: RegisterDto = {
          name: 'Kaue',
          email: 'duplicado@email.com',
          password: '123',
          date_of_birth: "1990-11-25",
          phone: '11954866282',
          accepted_terms: false
      };

      mockAuthService.register.mockRejectedValue(
        new BadRequestException('E-mail já cadastrado'),
      );

      await expect(controller.register(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ==================================================
  // 🔑 TESTES DO LOGIN
  // ==================================================
  describe('login', () => {
    it('✅ deve realizar login com sucesso', async () => {
      const dto: LoginDto = { email: 'kaue@email.com', password: '123' };
      const result = { token: 'fake-jwt-token' };

      mockAuthService.login.mockResolvedValue(result);

      const response = await controller.login(dto);

      expect(response).toEqual(result);
      expect(service.login).toHaveBeenCalledWith(dto);
    });

    it('🚫 deve lançar erro se credenciais forem inválidas', async () => {
      const dto: LoginDto = { email: 'invalido@email.com', password: 'errada' };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Credenciais inválidas'),
      );

      await expect(controller.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('🚫 deve lançar erro se faltar e-mail ou senha', async () => {
      const dto: LoginDto = { email: '', password: '' };

      mockAuthService.login.mockRejectedValue(
        new BadRequestException('E-mail e senha são obrigatórios'),
      );

      await expect(controller.login(dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ==================================================
  // 👤 TESTES DO GET PROFILE
  // ==================================================
  describe('getProfile', () => {
    it('✅ deve retornar o perfil do usuário autenticado', async () => {
      const user = { id: 1, email: 'kaue@email.com' };
      const result = { id: 1, name: 'Kaue' };

      mockAuthService.getProfile.mockResolvedValue(result);

      const response = await controller.getProfile(user);

      expect(response).toEqual(result);
      expect(service.getProfile).toHaveBeenCalledWith(user);
    });

    it('🚫 deve lançar erro se usuário não existir', async () => {
      const user = { id: 99, email: 'naoexiste@email.com' };

      mockAuthService.getProfile.mockRejectedValue(
        new BadRequestException('Usuário não encontrado'),
      );

      await expect(controller.getProfile(user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('🚫 deve lançar erro se usuário for nulo', async () => {
      mockAuthService.getProfile.mockRejectedValue(
        new UnauthorizedException('Token inválido'),
      );

      await expect(controller.getProfile(null)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
