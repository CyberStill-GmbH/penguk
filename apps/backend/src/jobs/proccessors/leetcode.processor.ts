import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Platform } from "../../../generated/prisma";
import { JobsService } from "../jobs.service";

@Processor("leetcode", { concurrency: 1 })
export class LeetcodeProcessor extends WorkerHost {
  constructor(private readonly jobsService: JobsService) {
    super();
  }

  process() {
    return this.jobsService.syncDueAccounts(Platform.Leetcode);
  }
}
