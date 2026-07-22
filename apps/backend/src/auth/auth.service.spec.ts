// auth.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: {
    refreshToken: {
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwt: { verifyAsync: jest.Mock; signAsync: jest.Mock };

  beforeEach(async () => {
    prisma = {
      refreshToken: {
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };
    jwt = {
      verifyAsync: jest.fn(),
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { validateCredentials: jest.fn(), findOne: jest.fn() },
        },
        { provide: JwtService, useValue: jwt },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("refresh", () => {
    it("throws UnauthorizedException si el token no existe", async () => {
      jwt.verifyAsync.mockResolvedValue({ sub: "user-1", jti: "jti-1" });
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh("fake-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
