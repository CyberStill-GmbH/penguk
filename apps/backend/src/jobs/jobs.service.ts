import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { IntegrationStatus, Platform } from "../../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { PlatformRegistryService } from "../integrations/strategies/platform-registry.service";

const SYNC_INTERVAL_MS: Record<Platform, number> = {
  [Platform.Codeforces]: 6 * 60 * 60 * 1000,
  [Platform.Leetcode]: 12 * 60 * 60 * 1000,
};

type SyncQueueJob = { platform: Platform };

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: PlatformRegistryService,
    @InjectQueue("codeforces") private readonly codeforcesQueue: Queue,
    @InjectQueue("leetcode") private readonly leetcodeQueue: Queue,
  ) {}

  /** Schedules one global job per platform; it never enqueues work per user. */
  async schedulerSyncs() {
    await Promise.all([
      this.schedulePlatformSync(Platform.Codeforces),
      this.schedulePlatformSync(Platform.Leetcode),
    ]);
  }

  async schedulePlatformSync(platform: Platform) {
    const queue = this.queueFor(platform);
    await queue.add("sync-due-accounts", { platform } satisfies SyncQueueJob, {
      jobId: `sync-due-accounts:${platform}`,
      attempts: 3,
      backoff: { type: "exponential", delay: 30_000 },
      removeOnComplete: true,
      removeOnFail: 100,
    });
  }

  /** Called by the single platform worker. Accounts are processed serially. */
  async syncDueAccounts(platform: Platform) {
    const cutoff = new Date(Date.now() - SYNC_INTERVAL_MS[platform]);
    const accounts = await this.prisma.account.findMany({
      where: {
        platform,
        integration: { is: { lastSync: { lte: cutoff } } },
      },
      select: { id: true },
      orderBy: { integration: { lastSync: "asc" } },
    });

    for (const account of accounts) {
      await this.syncAccount(account.id);
    }

    return { platform, processed: accounts.length };
  }

  async syncAccount(accountId: string) {
    const account = await this.prisma.account.findUniqueOrThrow({
      where: { id: accountId },
      include: { integration: true },
    });

    if (!account.integration) return;

    await this.prisma.integration.update({
      where: { id: account.integration.id },
      data: { status: IntegrationStatus.Syncing, lastError: null },
    });

    try {
      const result = await this.registry
        .getStrategy(account.platform)
        .syncUserData(account.handle);
      const syncedAt = new Date();

      await this.prisma.integration.update({
        where: { id: account.integration.id },
        data: {
          status: result.status,
          lastError: result.lastError ?? null,
          lastSync: syncedAt,
        },
      });

      if (result.stats) {
        await this.prisma.platformStats.create({
          data: {
            accountId: account.id,
            rating: result.stats.rating,
            solvedCount: result.stats.solved,
            recordedAt: syncedAt,
          },
        });
      }
    } catch (error: unknown) {
      const lastError =
        error instanceof Error
          ? error.message
          : "Error desconocido durante la sincronización";
      await this.prisma.integration.update({
        where: { id: account.integration.id },
        data: {
          status: IntegrationStatus.Error,
          lastError,
          lastSync: new Date(),
        },
      });
    }
  }

  private queueFor(platform: Platform): Queue {
    return platform === Platform.Codeforces
      ? this.codeforcesQueue
      : this.leetcodeQueue;
  }
}
