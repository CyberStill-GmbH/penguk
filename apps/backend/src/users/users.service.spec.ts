import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "./users.service";

vi.mock("bcrypt", () => ({ hash: vi.fn(), compare: vi.fn() }));

describe("UsersService", () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: Mock;
      create: Mock;
      update: Mock;
      delete: Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(UsersService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("creates a user with a hashed password", async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
    prisma.user.create.mockResolvedValue({ id: "user-1" });

    await service.create("ada", "ada@example.com", "secret");

    expect(bcrypt.hash).toHaveBeenCalledWith("secret", 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        username: "ada",
        email: "ada@example.com",
        passwordHash: "hashed-password",
        preferences: {},
      },
    });
  });

  it("merges preferences with the stored values", async () => {
    prisma.user.findUnique.mockResolvedValue({
      preferences: { theme: "light" },
    });
    prisma.user.update.mockResolvedValue({ id: "user-1" });

    await service.updatePreferences("user-1", { language: "es" });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { preferences: { theme: "light", language: "es" } },
    });
  });

  it("throws when deleting an unknown user", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.deleteUser("missing")).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it("returns the user only for valid credentials", async () => {
    const user = { id: "user-1", passwordHash: "hash" };
    prisma.user.findUnique.mockResolvedValue(user);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await expect(
      service.validateCredentials("ada@example.com", "secret"),
    ).resolves.toBe(user);
    expect(bcrypt.compare).toHaveBeenCalledWith("secret", "hash");
  });
});
