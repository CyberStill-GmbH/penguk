import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { ExportsService } from "../exports/exports.service";
import { UsersController } from "./users.controller";

describe("UsersController", () => {
  let controller: UsersController;
  let exportsService: { requestExport: Mock; getExportStatus: Mock };

  beforeEach(async () => {
    exportsService = { requestExport: vi.fn(), getExportStatus: vi.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: ExportsService, useValue: exportsService }],
    }).compile();
    controller = module.get(UsersController);
  });

  it("returns the authenticated user", () => {
    const user = { userId: "user-1", email: "ada@example.com" };
    expect(controller.getMe({ user })).toBe(user);
  });

  it("requests an export for the authenticated user", async () => {
    exportsService.requestExport.mockResolvedValue({ id: "export-1" });

    await expect(
      controller.requestExport({ user: { userId: "user-1" } }),
    ).resolves.toEqual({ id: "export-1" });
    expect(exportsService.requestExport).toHaveBeenCalledWith("user-1");
  });

  it("gets only the authenticated user's export status", async () => {
    exportsService.getExportStatus.mockResolvedValue({ status: "Ready" });

    await expect(
      controller.getExportStatus({ user: { userId: "user-1" } }, "export-1"),
    ).resolves.toEqual({ status: "Ready" });
    expect(exportsService.getExportStatus).toHaveBeenCalledWith(
      "user-1",
      "export-1",
    );
  });
});
