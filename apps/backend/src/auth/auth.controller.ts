import { Controller, Post, Body, Res, Req } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginUserDto } from "./dto/login.dto";
import { RegisterUserDto } from "./dto/register.dto";
import { Throttle } from "@nestjs/throttler";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function getRefreshTokenFromCookies(req: Request): string | undefined {
  const cookies = req.cookies as Record<string, string> | undefined;
  return cookies?.refresh_token;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @Post("login")
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    const tokens = await this.authService.login(user);

    res.cookie("refresh_token", tokens.refresh_token, REFRESH_COOKIE_OPTIONS);

    return {
      access_token: tokens.access_token,
    };
  }

  @Throttle({
    default: {
      limit: 3,
      ttl: 60000,
    },
  })
  @Post("register")
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto.username, dto.email, dto.password);
  }

  @Post("logout")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = getRefreshTokenFromCookies(req);

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie("refresh_token", REFRESH_COOKIE_OPTIONS);

    return {
      message: "Sesión cerrada",
    };
  }

  @Throttle({
    default: {
      limit: 20,
      ttl: 60000,
    },
  })
  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = getRefreshTokenFromCookies(req);

    const tokens = await this.authService.refresh(refreshToken);

    res.cookie("refresh_token", tokens.refreshToken, REFRESH_COOKIE_OPTIONS);

    return {
      access_token: tokens.accessToken,
    };
  }
}
