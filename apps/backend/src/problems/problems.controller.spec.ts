import { Test, TestingModule } from "@nestjs/testing";
import { ProblemsController } from "./problems.controller";
import { ProblemsService } from "./problems.service";
import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";

describe("ProblemsController", () => {
  let controller: ProblemsController;
  let problemsService: {
    list: Mock;
    findOne: Mock;
  };

  beforeEach(async () => {
    problemsService = {
      list: vi.fn(),
      findOne: vi.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemsController],
      providers: [{ provide: ProblemsService, useValue: problemsService }],
    }).compile();

    controller = module.get<ProblemsController>(ProblemsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("list delega al service con el query recibido", async () => {
    const fakeResult = {
      data: [],
      pagination: { total: 0, limit: 20, offset: 0 },
    };
    problemsService.list.mockResolvedValue(fakeResult);

    const result = await controller.list({ limit: 20, offset: 0 });

    expect(problemsService.list).toHaveBeenCalledWith({ limit: 20, offset: 0 });
    expect(result).toEqual(fakeResult);
  });

  it("findOne delega al service con el id recibido", async () => {
    const fakeProblem = { id: "abc", title: "Two SUm" };
    problemsService.findOne.mockResolvedValue(fakeProblem);

    const result = await controller.findOne("abc");

    expect(problemsService.findOne).toHaveBeenCalledWith("abc");
    expect(result).toEqual(fakeProblem);
  });
});
