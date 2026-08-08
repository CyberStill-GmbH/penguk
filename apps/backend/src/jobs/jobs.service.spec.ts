import { IntegrationStatus, Platform } from "../../generated/prisma";
import { PlatformRegistryService } from "../integrations/strategies/platform-registry.service";
import { PrismaService } from "../prisma/prisma.service";
import { JobsService } from "./jobs.service";

describe("JobsService", () => {
  const prisma = {
    account: { findMany: vi.fn(), findUniqueOrThrow: vi.fn() },
    integration: { update: vi.fn() },
    platformStats: { create: vi.fn() },
  };
  const registry = { getStrategy: vi.fn() };
  const codeforcesQueue = { add: vi.fn() };
  const leetcodeQueue = { add: vi.fn() };
  let service: JobsService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new JobsService(
      prisma as unknown as PrismaService,
      registry as unknown as PlatformRegistryService,
      codeforcesQueue as never,
      leetcodeQueue as never,
    );
  });

  it("schedules one global synchronization job for each platform", async () => {
    await service.schedulerSyncs();

    expect(codeforcesQueue.add).toHaveBeenCalledWith(
      "sync-due-accounts",
      { platform: Platform.Codeforces },
      expect.objectContaining({ jobId: "sync-due-accounts:Codeforces" }),
    );
    expect(leetcodeQueue.add).toHaveBeenCalledWith(
      "sync-due-accounts",
      { platform: Platform.Leetcode },
      expect.objectContaining({ jobId: "sync-due-accounts:Leetcode" }),
    );
  });

  it("processes due accounts serially and stores a snapshot", async () => {
    prisma.account.findMany.mockResolvedValue([{ id: "account-1" }]);
    prisma.account.findUniqueOrThrow.mockResolvedValue({
      id: "account-1",
      platform: Platform.Codeforces,
      handle: "tourist",
      integration: { id: "integration-1" },
    });
    registry.getStrategy.mockReturnValue({
      syncUserData: vi.fn().mockResolvedValue({
        status: IntegrationStatus.Connected,
        stats: { rating: 4000, solved: 5000 },
      }),
    });

    await expect(service.syncDueAccounts(Platform.Codeforces)).resolves.toEqual(
      { platform: Platform.Codeforces, processed: 1 },
    );

    expect(registry.getStrategy).toHaveBeenCalledWith(Platform.Codeforces);
    expect(prisma.platformStats.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        accountId: "account-1",
        rating: 4000,
        solvedCount: 5000,
      }),
    });
    expect(prisma.integration.update).toHaveBeenLastCalledWith({
      where: { id: "integration-1" },
      data: expect.objectContaining({ status: IntegrationStatus.Connected }),
    });
  });
});
