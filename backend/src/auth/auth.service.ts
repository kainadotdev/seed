import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 12;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PublicUser {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
}

/**
 * Responsável por cadastro, login, emissão/rotação de tokens e logout.
 *
 * Estratégia de tokens:
 * - Access token: JWT stateless de curta duração (ex.: 15min), enviado no header Authorization.
 * - Refresh token: valor aleatório opaco, cujo HASH é persistido no banco (RefreshToken),
 *   permitindo revogação real no logout — nunca usamos localStorage para nenhum dos dois.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: PublicUser; tokens: TokenPair }> {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Este nome de usuário já está em uso.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        username: dto.username,
        passwordHash,
      },
    });

    const tokens = await this.issueTokenPair(user.id, user.username);
    return { user: this.toPublicUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<{ user: PublicUser; tokens: TokenPair }> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!user) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }

    const tokens = await this.issueTokenPair(user.id, user.username);
    return { user: this.toPublicUser(user), tokens };
  }

  /** Revoga um refresh token específico (logout do dispositivo atual). */
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Emite um novo par de tokens a partir de um refresh token válido (rotação). */
  async refresh(refreshToken: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }

    // Rotação: revoga o token usado e emite um novo par.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokenPair(stored.user.id, stored.user.username);
  }

  /** Usado por GET /auth/me para restaurar a sessão do frontend sem depender de cache local. */
  async getPublicUserById(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }
    return this.toPublicUser(user);
  }

  private async issueTokenPair(userId: string, username: string): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, username },
      {
        secret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      },
    );

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private toPublicUser(user: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
    bio: string | null;
    createdAt: Date;
  }): PublicUser {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    };
  }
}
