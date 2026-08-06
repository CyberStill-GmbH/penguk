import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { S3Provider } from "./providers/s3.provider";
import { ExportStatus } from "../../generated/prisma";

const SIGNED_URL_TTL_SECONDS = 24 * 60 * 60;

@Injectable()
export class ExportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Provider,
  ) {}

  async requestExport(userId: string) {
    const pending = await this.prisma.export.findFirst({
      where: { userId, status: ExportStatus.Processing },
    });
    if (pending) return pending;

    const record = await this.prisma.export.create({
      data: { userId, status: ExportStatus.Processing },
    });

    void this.processExport(record.id, userId);

    return record;
  }

  async getExportStatus(userId: string, exportId: string) {
    const record = await this.prisma.export.findFirst({
      where: { id: exportId, userId },
    });
    if (!record) throw new NotFoundException("Export no encontrado");

    if (record.status === ExportStatus.Ready && record.fileKey) {
      const url = await this.s3.getSignedDownloadUrl(
        record.fileKey,
        SIGNED_URL_TTL_SECONDS,
      );
      return {
        status: record.status,
        downloadUrl: url,
        expiresAt: record.expiresAt,
      };
    }

    return { status: record.status, error: record.error };
  }

  private async processExport(exportId: string, userId: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
        include: {
          problemReviews: { include: { reviews: true } },
          contestParticipations: { include: { contestSolvedProblems: true } },
          upsolves: true,
          accounts: { include: { integration: true, stats: true } },
          repository: { include: { notes: true } },
        },
      });

      const safeUser = Object.fromEntries(
        Object.entries(user).filter(([key]) => key !== "passwordHash"),
      );

      const key = `exports/${userId}/${exportId}.json`;
      await this.s3.uploadJson(key, safeUser);

      const expiresAt = new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000);

      await this.prisma.export.update({
        where: { id: exportId },
        data: { status: ExportStatus.Ready, fileKey: key, expiresAt },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      await this.prisma.export.update({
        where: { id: exportId },
        data: { status: ExportStatus.Failed, error: message },
      });
    }
  }
}
