import { Injectable, NotFoundException } from "@nestjs/common";
import { Platform } from "../../generated/prisma";
import { IntegrationStatus } from "../../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  connectIntegration(userId: string, platform: Platform, handle: string) {
    return this.prisma.account.upsert({
      where: { userId_platform: { userId, platform } },
      create: {
        userId,
        platform,
        handle,
        integration: {
          create: {
            status: IntegrationStatus.Connected,
            // Make a newly connected account eligible for the global worker.
            lastSync: new Date(0),
          },
        },
      },
      update: {
        handle,
        integration: {
          upsert: {
            create: {
              status: IntegrationStatus.Connected,
              lastSync: new Date(0),
            },
            update: {
              status: IntegrationStatus.Connected,
              lastError: null,
              lastSync: new Date(0),
            },
          },
        },
      },
      include: { integration: true },
    });
  }

  async triggerSync(userId: string, integrationId: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id: integrationId, account: { userId } },
      select: { id: true },
    });
    if (!integration) {
      throw new NotFoundException("Integration not found");
    }

    return this.prisma.integration.update({
      where: { id: integration.id },
      data: {
        status: IntegrationStatus.Syncing,
        lastError: null,
        // The cron or global endpoint will include it in the next shared job.
        lastSync: new Date(0),
      },
    });
  }
}
