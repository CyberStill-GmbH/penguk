import { Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { JobsService } from "./jobs.service";

@Controller("jobs")
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /** Triggers the two deduplicated, platform-wide synchronization jobs. */
  @Post("sync")
  async syncDueAccounts() {
    await this.jobsService.schedulerSyncs();
    return { status: "scheduled", scope: "global" };
  }
}
