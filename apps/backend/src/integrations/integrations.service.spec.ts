import { IntegrationStatus, Platform } from "../../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { IntegrationsService } from "./integrations.service";

describe("IntegrationsService", () => {
  const prisma = {
    account: { upsert: vi.fn() },
    integration: { findFirst: vi.fn(), update: vi.fn() },
  };
  let service: IntegrationsService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new IntegrationsService(prisma as unknown as PrismaService);
  });

  it("creates an integration eligible for the shared synchronization job", async () => {
    prisma.account.upsert.mockResolvedValue({ id: "account-1" });

    await service.connectIntegration("user-1", Platform.Codeforces, "tourist");

    expect(prisma.account.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_platform: { userId: "user-1", platform: Platform.Codeforces },
        },
        create: expect.objectContaining({
          integration: {
            create: expect.objectContaining({ lastSync: new Date(0) }),
          },
        }),
      }),
    );
  });

  it("marks only the owner's integration as pending", async () => {
    prisma.integration.findFirst.mockResolvedValue({ id: "integration-1" });
    prisma.integration.update.mockResolvedValue({ id: "integration-1" });

    await service.triggerSync("user-1", "integration-1");

    expect(prisma.integration.update).toHaveBeenCalledWith({
      where: { id: "integration-1" },
      data: expect.objectContaining({
        status: IntegrationStatus.Syncing,
        lastSync: new Date(0),
      }),
    });
  });
});
