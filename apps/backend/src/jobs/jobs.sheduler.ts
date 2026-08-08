import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { JobsService } from "./jobs.service";

@Injectable()
export class JobsScheduler {
  constructor(private readonly jobsService: JobsService) {}

  @Cron("*/10 * * * *")
  async handleSyncs() {
    await this.jobsService.schedulerSyncs();
  }
}
