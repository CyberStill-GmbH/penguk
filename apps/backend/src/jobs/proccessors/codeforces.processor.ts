import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Platform } from "../../../generated/prisma";
import { JobsService } from "../jobs.service";

@Processor("codeforces", { concurrency: 1 })
export class CodeforcesProcessor extends WorkerHost {
  constructor(private readonly jobsService: JobsService) {
    super();
  }

  process() {
    return this.jobsService.syncDueAccounts(Platform.Codeforces);
  }
}
