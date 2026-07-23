import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) {}

  async findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  async create(username: string, email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);

    return this.db.user.create({
      data: {
        username,
        email,
        passwordHash: hash,
        preferences: {},
      },
    });
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user || !user.passwordHash) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);

    return valid ? user : null;
  }

  async findOrCreateFromOAuth(data: {
    provider: "GitHub";
    providerAccountId: string;
    email: string;
    username: string;
  }) {
    const authAccount = await this.db.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        },
      },
      include: { user: true },
    });
    if (authAccount) return authAccount.user;

    const existingUser = await this.db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      await this.db.authAccount.create({
        data: {
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          userId: existingUser.id,
        },
      });
      return existingUser;
    }

    return this.db.user.create({
      data: {
        email: data.email,
        username: data.username,
        preferences: {},
        authAccounts: {
          create: {
            provider: data.provider,
            providerAccountId: data.providerAccountId,
          },
        },
      },
    });
  }
}
