import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { ExportStatus } from "../../generated/prisma";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { PrismaService } from "../prisma/prisma.service";
import { S3Provider } from "./providers/s3.provider";
import { ExportsService } from "./exports.service";

describe("ExportsService", () => {
  let service: ExportsService;
  let prisma: { export: { findFirst: Mock; create: Mock; update: Mock } };
  let s3: { getSignedDownloadUrl: Mock };

  beforeEach(async () => {
    prisma = {
      export: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    };
    s3 = { getSignedDownloadUrl: vi.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportsService,
        { provide: PrismaService, useValue: prisma },
        { provide: S3Provider, useValue: s3 },
      ],
    }).compile();
    service = module.get(ExportsService);
  });

  it("returns an existing processing export", async () => {
    const pending = { id: "export-1", status: ExportStatus.Processing };
    prisma.export.findFirst.mockResolvedValue(pending);

    await expect(service.requestExport("user-1")).resolves.toBe(pending);
    expect(prisma.export.create).not.toHaveBeenCalled();
  });

  it("creates an export when there is no pending request", async () => {
    prisma.export.findFirst.mockResolvedValue(null);
    const record = { id: "export-1", status: ExportStatus.Processing };
    prisma.export.create.mockResolvedValue(record);

    await expect(service.requestExport("user-1")).resolves.toBe(record);
    expect(prisma.export.create).toHaveBeenCalledWith({
      data: { userId: "user-1", status: ExportStatus.Processing },
    });
  });

  it("returns a signed URL for a ready export", async () => {
    const expiresAt = new Date("2026-08-06T00:00:00Z");
    prisma.export.findFirst.mockResolvedValue({
      status: ExportStatus.Ready,
      fileKey: "exports/user-1/export-1.json",
      expiresAt,
    });
    s3.getSignedDownloadUrl.mockResolvedValue("https://example.test/export");

    await expect(
      service.getExportStatus("user-1", "export-1"),
    ).resolves.toEqual({
      status: ExportStatus.Ready,
      downloadUrl: "https://example.test/export",
      expiresAt,
    });
    expect(s3.getSignedDownloadUrl).toHaveBeenCalledWith(
      "exports/user-1/export-1.json",
      86400,
    );
  });

  it("does not disclose exports owned by another user", async () => {
    prisma.export.findFirst.mockResolvedValue(null);

    await expect(service.getExportStatus("user-1", "export-2")).rejects.toThrow(
      NotFoundException,
    );
  });
});
