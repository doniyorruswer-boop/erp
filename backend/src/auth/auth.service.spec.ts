import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../audit/audit.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService (Unit Tests)', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let auditService: any;

  const mockUser = {
    id: 'user-uuid-1',
    phone: '+998901234567',
    email: 'admin@educrm.uz',
    password: '',
    role: 'SUPER_ADMIN',
    isActive: true,
    deletedAt: null,
    organizationId: null,
    firstName: 'Alisher',
    lastName: 'Navoiy',
    hashedRefreshToken: null,
  };

  beforeAll(async () => {
    mockUser.password = await bcrypt.hash('admin123', 10);
  });

  beforeEach(async () => {
    const userFinderMock = jest.fn();
    prisma = {
      user: {
        findUnique: userFinderMock,
        findFirst: userFinderMock,
        update: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-token-jwt'),
      verify: jest.fn(),
    };

    auditService = {
      log: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully with valid password and return accessToken and refreshToken', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, hashedRefreshToken: 'hashed_rt' });

      const result = await service.login({ phone: '+998901234567', password: 'admin123' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.phone).toBe('+998901234567');
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, failedLoginAttempts: 1 });

      await expect(
        service.login({ phone: '+998901234567', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should lock account after 5 failed password attempts', async () => {
      const userWith4Fails = { ...mockUser, failedLoginAttempts: 4 };
      prisma.user.findUnique.mockResolvedValue(userWith4Fails);
      prisma.user.update.mockResolvedValue({ ...userWith4Fails, lockedUntil: new Date(Date.now() + 900000) });

      await expect(
        service.login({ phone: '+998901234567', password: 'wrongpassword' }),
      ).rejects.toThrow(/15 daqiqaga bloklandi/);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({ failedLoginAttempts: 0, lockedUntil: expect.any(Date) }),
        }),
      );
    });

    it('should reject login if account is currently locked out', async () => {
      const lockedUser = { ...mockUser, lockedUntil: new Date(Date.now() + 10 * 60 * 1000) };
      prisma.user.findUnique.mockResolvedValue(lockedUser);

      await expect(
        service.login({ phone: '+998901234567', password: 'admin123' }),
      ).rejects.toThrow(/vaqtincha bloklangan/);
    });

    it('should throw UnauthorizedException if user not found or inactive', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ phone: '+998999999999', password: 'admin' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should rotate tokens when valid refresh token is passed', async () => {
      const rawRefreshToken = 'valid-refresh-token';
      const hashed = await bcrypt.hash(rawRefreshToken, 10);
      const userWithRt = { ...mockUser, hashedRefreshToken: hashed };

      jwtService.verify.mockReturnValue({ sub: 'user-uuid-1' });
      prisma.user.findUnique.mockResolvedValue(userWithRt);
      prisma.user.update.mockResolvedValue(userWithRt);

      const result = await service.refreshTokens(rawRefreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException if refresh token is invalid or expired', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshTokens('expired-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException and invalidate token if hash does not match (reuse detected)', async () => {
      const storedHash = await bcrypt.hash('different-token', 10);
      const userWithRt = { ...mockUser, hashedRefreshToken: storedHash };

      jwtService.verify.mockReturnValue({ sub: 'user-uuid-1' });
      prisma.user.findUnique.mockResolvedValue(userWithRt);
      prisma.user.update.mockResolvedValue({ ...userWithRt, hashedRefreshToken: null });

      await expect(service.refreshTokens('tampered-or-reused-token')).rejects.toThrow(ForbiddenException);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { hashedRefreshToken: null },
      });
    });
  });

  describe('logout', () => {
    it('should nullify hashedRefreshToken in DB', async () => {
      prisma.user.update.mockResolvedValue({ ...mockUser, hashedRefreshToken: null });

      const res = await service.logout('user-uuid-1');

      expect(res.success).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { hashedRefreshToken: null },
      });
    });
  });
});
