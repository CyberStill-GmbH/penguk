import { Injectable } from "@nestjs/common";
import { Platform } from "../../generated/prisma";

@Injectable()
export class IntegrationsService {
  async connectIntegration(userId: string, platform: Platform, handle: string) {
    return { id: "account-1", userId, platform, handle };
  }

  async triggerSync(integrationId: string) {
    return { id: integrationId, status: "Connected", lastSync: new Date() };
  }
}
