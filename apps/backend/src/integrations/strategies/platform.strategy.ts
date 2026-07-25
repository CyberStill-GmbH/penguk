import { Platform, IntegrationStatus } from "@prisma/client";

export interface SyncResult {
  status: IntegrationStatus;
  lastError?: string | null;
  stats?: {
    solved?: number;
    rating?: number;
  };
}

export interface IPlatformStrategy {
  platform: Platform;

  // obtener datos del usuario y transformarlo en formato de la DB
  syncUserData(
    handle: string,
    credentials?: Record<string, any>,
  ): Promise<SyncResult>;
}
