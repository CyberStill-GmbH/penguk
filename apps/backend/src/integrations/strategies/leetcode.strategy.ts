// strategies/leetcode.strategy.ts
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Platform, IntegrationStatus } from "../../../generated/prisma"; // ajusta la ruta relativa a tu proyecto
import { IPlatformStrategy, SyncResult } from "./platform.strategy";
import { PlatformRegistryService } from "./platform-registry.service";

interface LeetCodeAcSubmission {
  difficulty: string;
  count: number;
}

interface LeetCodeProfileResponse {
  data: {
    matchedUser: {
      submitStatsGlobal: {
        acSubmissionNum: LeetCodeAcSubmission[];
      };
    } | null;
    userContestRanking: {
      rating: number;
      globalRanking: number;
    } | null;
  };
}

@Injectable()
export class LeetcodeStrategy implements IPlatformStrategy, OnModuleInit {
  platform = Platform.Leetcode;
  private readonly GRAPHQL_URL = "https://leetcode.com/graphql";

  constructor(private readonly registry: PlatformRegistryService) {}

  onModuleInit() {
    this.registry.registerStrategy(this);
  }

  async syncUserData(handle: string): Promise<SyncResult> {
    try {
      const profileQuery = `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            submitStatsGlobal {
              acSubmissionNum { difficulty count }
            }
          }
          userContestRanking(username: $username) {
            rating
            globalRanking
          }
        }
      `;

      const response = await fetch(this.GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: "https://leetcode.com",
          "User-Agent": "Penguk-Integration-Bot/1.0",
        },
        body: JSON.stringify({
          query: profileQuery,
          variables: { username: handle },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as LeetCodeProfileResponse;
      const user = data.data.matchedUser;
      const ranking = data.data.userContestRanking;

      if (!user) {
        throw new Error("Usuario no encontrado en LeetCode");
      }

      const totalSolved = user.submitStatsGlobal.acSubmissionNum.reduce(
        (acc, curr) => acc + curr.count,
        0,
      );

      return {
        status: IntegrationStatus.Connected,
        stats: {
          solved: totalSolved,
          rating: ranking?.rating,
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
