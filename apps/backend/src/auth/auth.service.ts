import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";

interface RefreshTokenPayload {
  sub: string;
  jti: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private async saveRefreshToken(
    userId: string,
    refreshToken: string,
    jti: string,
  ) {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        jti,
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  private async generateAccessToken(userId: string, email: string) {
    return this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: "10m",
      },
    );
  }

  private async generateRefreshToken(userId: string, email: string) {
    const jti = randomUUID();

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, jti, email },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: "30d",
      },
    );

    await this.saveRefreshToken(userId, refreshToken, jti);

    return refreshToken;
  }

  // refresh token with invalid token handling
  async refresh(refreshToken?: string) {
    try {
      if (!refreshToken) {
        throw new UnauthorizedException("Refresh token no encontrado");
      }

      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        { secret: process.env.JWT_REFRESH_SECRET },
      );

      const userId = payload.sub;
      const jti = payload.jti;

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { jti },
      });

      if (!storedToken) {
        throw new UnauthorizedException("Refresh token inválido");
      }

      if (storedToken.revokedAt) {
        // reuse de un token ya revocado -> posible robo, revoca todo
        await this.prisma.refreshToken.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException("Refresh token revocado");
      }

      if (storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException("Refresh token expirado");
      }

      const validToken = await bcrypt.compare(
        refreshToken,
        storedToken.tokenHash,
      );

      if (!validToken) {
        throw new UnauthorizedException("Refresh token inválido");
      }

      await this.revokeRefreshToken(jti);

      const newAccessToken = await this.generateAccessToken(
        userId,
        payload.email,
      );
      const newRefreshToken = await this.generateRefreshToken(
        userId,
        payload.email,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException("Refresh token inválido");
    }
  }

  private async revokeRefreshToken(jti: string) {
    await this.prisma.refreshToken.update({
      where: { jti },
      data: { revokedAt: new Date() },
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.validateCredentials(email, password);
    if (!user) throw new UnauthorizedException();
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      preferences: user.preferences,
    };
    return safeUser;
  }

  async login(user: { id: string; email: string }) {
    const accessToken = await this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id, user.email);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async register(username: string, email: string, password: string) {
    return this.usersService.create(username, email, password);
  }

  // Logout by deleting refresh token from database and handle invalid tokens
  async logout(refreshToken?: string) {
    try {
      if (!refreshToken) {
        return { message: "Sesión cerrada" };
      }

      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        { secret: process.env.JWT_REFRESH_SECRET },
      );

      await this.revokeRefreshToken(payload.jti);

      return {
        message: "Sesión cerrada",
      };
    } catch {
      throw new UnauthorizedException("Token Inválido");
    }
  }
}
