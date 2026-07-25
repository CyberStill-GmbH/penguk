import { Injectable, OnModuleInit } from "@nestjs/common";
import { Platform, IntegrationStatus } from "../../../generated/prisma";
import { IPlatformStrategy, SyncResult } from "./platform.strategy";
import { PlatformRegistryService } from "./platform-registry.service";

interface CodeforcesUserInfoResponse {
  status: "OK" | "FAILED";
  comment?: string;
  result?: { handle: string; rating?: number; rank?: string }[];
}

interface CodeforcesSubmission {
  verdict?: string;
  problem: { contestId?: number; index: string; name: string };
}

interface CodeforcesUserStatusResponse {
  status: "OK" | "FAILED";
  comment?: string;
  result?: CodeforcesSubmission[];
}

@Injectable()
export class CodeforcesStrategy implements IPlatformStrategy, OnModuleInit {
  platform = Platform.Codeforces;
  private readonly API_URL = "https://codeforces.com/api";

  constructor(private readonly registry: PlatformRegistryService) {}

  onModuleInit() {
    this.registry.registerStrategy(this);
  }

  async syncUserData(handle: string): Promise<SyncResult> {
    try {
      const infoRes = await fetch(
        `${this.API_URL}/user.info?handles=${encodeURIComponent(handle)}`,
      );
      if (!infoRes.ok) throw new Error(`HTTP ${infoRes.status}`);

      const infoData = (await infoRes.json()) as CodeforcesUserInfoResponse;
      if (infoData.status !== "OK" || !infoData.result?.length) {
        throw new Error(
          infoData.comment ?? "Usuario no encontrado en Codeforces",
        );
      }

      const rating = infoData.result[0].rating;

      const statusRes = await fetch(
        `${this.API_URL}/user.status?handle=${encodeURIComponent(handle)}`,
      );
      if (!statusRes.ok) throw new Error(`HTTP ${statusRes.status}`);

      const statusData =
        (await statusRes.json()) as CodeforcesUserStatusResponse;
      if (statusData.status !== "OK") {
        throw new Error(
          statusData.comment ?? "No se pudieron obtener submissions",
        );
      }

      const solvedSet = new Set<string>();
      for (const sub of statusData.result ?? []) {
        if (sub.verdict === "OK") {
          solvedSet.add(`${sub.problem.contestId ?? ""}-${sub.problem.index}`);
        }
      }

      return {
        status: IntegrationStatus.Connected,
        stats: {
          solved: solvedSet.size,
          rating: rating,
        },
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      return {
        status: IntegrationStatus.Error,
        lastError: message,
      };
    }
  }
}
