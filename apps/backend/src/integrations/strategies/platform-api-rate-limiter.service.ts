import { Injectable } from "@nestjs/common";
import { Platform } from "../../../generated/prisma";

const MINIMUM_INTERVAL_MS: Record<Platform, number> = {
  // Codeforces documents a limit of one request every two seconds.
  [Platform.Codeforces]: 2_000,
  // LeetCode has no public quota for this GraphQL endpoint; stay conservative.
  [Platform.Leetcode]: 1_000,
};

@Injectable()
export class PlatformApiRateLimiter {
  private readonly nextRequestAt = new Map<Platform, number>();
  private readonly chains = new Map<Platform, Promise<void>>();

  async execute<T>(platform: Platform, request: () => Promise<T>): Promise<T> {
    const previous = this.chains.get(platform) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.chains.set(
      platform,
      previous.catch(() => undefined).then(() => current),
    );

    await previous.catch(() => undefined);
    const waitMs = Math.max(
      0,
      (this.nextRequestAt.get(platform) ?? 0) - Date.now(),
    );
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    this.nextRequestAt.set(
      platform,
      Date.now() + MINIMUM_INTERVAL_MS[platform],
    );

    try {
      return await request();
    } finally {
      release();
    }
  }
}
