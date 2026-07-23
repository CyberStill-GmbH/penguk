import { Injectable, UnauthorizedException } from "@nestjs/common";
import { randomBytes, createHash } from "crypto";
import { RedisService } from "../redis/redis.service";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";

const STATE_TTL_SECONDS = 300;

@Injectable()
export class GithubOauthService {
  constructor(
    private readonly redis: RedisService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  private base64url(buf: Buffer): string {
    return buf
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  async createAuthUrl(): Promise<string> {
    const state = this.base64url(randomBytes(32));
    const codeVerifier = this.base64url(randomBytes(32));
    const codeChallenge = this.base64url(
      createHash("sha256").update(codeVerifier).digest(),
    );

    // guardamos el verifier atado al state, con TTL — si expira, el callback falla solo
    await this.redis.set(
      `oauth:github:${state}`,
      codeVerifier,
      "EX",
      STATE_TTL_SECONDS,
    );

    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      redirect_uri: process.env.GITHUB_CALLBACK_URL!,
      scope: "read:user user:email",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, state: string) {
    const codeVerifier = await this.redis.get(`oauth:github:${state}`);

    if (!codeVerifier) {
      throw new UnauthorizedException("Estado OAuth inválido o expirado");
    }

    await this.redis.del(`oauth:github:${state}`);

    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: process.env.GITHUB_CALLBACK_URL,
          code_verifier: codeVerifier,
        }),
      },
    );

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenData.access_token) {
      throw new UnauthorizedException(
        tokenData.error_description ?? "Fallo al obtener token de Github",
      );
    }

    const profileRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = (await profileRes.json()) as {
      id: number;
      login: string;
      email: string | null;
    };
    let email = profile.email;
    if (!email) {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const emails = (await emailsRes.json()) as {
        email: string;
        primary: boolean;
        verified: boolean;
      }[];
      email = emails.find((e) => e.primary && e.verified)?.email ?? null;
    }

    if (!email) {
      throw new UnauthorizedException(
        "No se pudo obtener un email verificado de Github",
      );
    }

    const user = await this.usersService.findOrCreateFromOAuth({
      provider: "GitHub",
      providerAccountId: String(profile.id),
      email,
      username: profile.login,
    });

    return this.authService.login({ id: user.id, email: user.email });
  }
}
