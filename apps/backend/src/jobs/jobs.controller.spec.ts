import { Test } from "@nestjs/testing";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";

describe("JobsController", () => {
  it("schedules the shared platform jobs through the HTTP endpoint", async () => {
    const jobsService = {
      schedulerSyncs: vi.fn().mockResolvedValue(undefined),
    };
    const module = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [{ provide: JobsService, useValue: jobsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const controller = module.get(JobsController);

    await expect(controller.syncDueAccounts()).resolves.toEqual({
      status: "scheduled",
      scope: "global",
    });
    expect(jobsService.schedulerSyncs).toHaveBeenCalledOnce();
  });
});
