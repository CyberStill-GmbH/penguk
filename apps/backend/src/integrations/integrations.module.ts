import { Module } from "@nestjs/common";
import { IntegrationsService } from "./integrations.service";
import { IntegrationsController } from "./integrations.controller";
import { CodeforcesStrategy } from "./strategies/codeforces.strategy";
import { LeetcodeStrategy } from "./strategies/leetcode.strategy";
import { PlatformApiRateLimiter } from "./strategies/platform-api-rate-limiter.service";
import { PlatformRegistryService } from "./strategies/platform-registry.service";

@Module({
  providers: [
    IntegrationsService,
    PlatformRegistryService,
    PlatformApiRateLimiter,
    CodeforcesStrategy,
    LeetcodeStrategy,
  ],
  controllers: [IntegrationsController],
  exports: [PlatformRegistryService],
})
export class IntegrationsModule {}
