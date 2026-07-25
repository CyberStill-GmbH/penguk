import { Injectable } from "@nestjs/common";
import { Platform } from "@prisma/client";
import { IPlatformStrategy } from "./platform.strategy";

@Injectable()
export class PlatformRegistryService {
  private strategies = new Map<Platform, IPlatformStrategy>();

  registerStrategy(strategy: IPlatformStrategy) {
    this.strategies.set(strategy.platform, strategy);
  }

  getStrategy(platform: Platform): IPlatformStrategy {
    const strategy = this.strategies.get(platform);
    if (!strategy) {
      throw new Error(
        `No hay estrategia registrada para la plataforma: ${platform}`,
      );
    }
    return strategy;
  }
}
