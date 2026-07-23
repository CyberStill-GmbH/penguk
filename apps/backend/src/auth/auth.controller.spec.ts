import { vi } from 'vitest';
// auth.controller.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { GithubOauthService } from "./github-oauth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      validateUser: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      refresh: vi.fn(),
      logout: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: GithubOauthService, useValue: { createAuthUrl: vi.fn(), handleCallback: vi.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
