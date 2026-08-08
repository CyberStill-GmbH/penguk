import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IntegrationsModule } from "../integrations/integrations.module";
import { JobsService } from "./jobs.service";
import { JobsScheduler } from "./jobs.sheduler";
import { JobsController } from "./jobs.controller";
import { CodeforcesProcessor } from "./proccessors/codeforces.processor";
import { LeetcodeProcessor } from "./proccessors/leetcode.processor";

@Module({
  imports: [
    IntegrationsModule,
    BullModule.registerQueue(
      {
        name: "codeforces",
      },
      {
        name: "leetcode",
      },
    ),
  ],

  providers: [
    JobsService,
    JobsScheduler,
    CodeforcesProcessor,
    LeetcodeProcessor,
  ],
  controllers: [JobsController],

  exports: [JobsService],
})
export class JobsModule {}
