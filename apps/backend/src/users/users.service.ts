import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";

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

  async updatePreferences(userId: string, preferences: UpdatePreferencesDto) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const updatePreferences = {
      ...((user?.preferences as UpdatePreferencesDto | null) ?? {}),
      ...preferences,
    };

    return this.db.user.update({
      where: { id: userId },
      data: { preferences: updatePreferences },
    });
  }

  async deleteUser(userId: string) {
    const user = await this.db.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return this.db.user.delete({ where: { id: userId } });
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
    accessToken: string;
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
          username: data.username,
          accessToken: data.accessToken,
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
            username: data.username,
            accessToken: data.accessToken,
          },
        },
      },
    });
  }
}
