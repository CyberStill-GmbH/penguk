import { Test, TestingModule } from "@nestjs/testing";
import { IntegrationsController } from "./integrations.controller";
import { IntegrationsService } from "./integrations.service";
import { Platform } from "../../generated/prisma";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";

describe("IntegrationsController", () => {
  let controller: IntegrationsController;
  let service: IntegrationsService;

  beforeEach(async () => {
    const mockIntegrationsService = {
      connectIntegration: vi.fn(),
      triggerSync: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegrationsController],
      providers: [
        {
          provide: IntegrationsService,
          useValue: mockIntegrationsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<IntegrationsController>(IntegrationsController);
    service = module.get<IntegrationsService>(IntegrationsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("connect", () => {
    it("should call integrationService.connectIntegration with correct parameters", async () => {
      const req = { user: { userId: "user-123", email: "test@example.com" } };
      const dto = { platform: Platform.Codeforces, handle: "testuser" };
      const mockResult = {
        id: "account-1",
        userId: "user-123",
        platform: Platform.Codeforces,
        handle: "testuser",
      };

      vi.spyOn(service, "connectIntegration").mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.connect(req as any, dto);

      expect(service.connectIntegration).toHaveBeenCalledWith(
        "user-123",
        Platform.Codeforces,
        "testuser",
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("sync", () => {
    it("should call integrationService.triggerSync with correct parameters", async () => {
      const integrationId = "int-456";
      const mockResult = {
        id: "int-456",
        status: "Connected",
        lastSync: new Date(),
      };

      vi.spyOn(service, "triggerSync").mockResolvedValue(mockResult as any);

      const result = await controller.sync(integrationId);

      expect(service.triggerSync).toHaveBeenCalledWith("int-456");
      expect(result).toEqual(mockResult);
    });
  });
});
