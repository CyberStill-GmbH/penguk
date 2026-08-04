import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { ProblemsService } from "./problems.service";
import { Platform } from "../../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";

describe("ProblemsService", () => {
  let service: ProblemsService;
  let prisma: {
    problem: {
      findMany: Mock;
      count: Mock;
      findUnique: Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      problem: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProblemsService>(ProblemsService);
  });

  it("should be difined", () => {
    expect(service).toBeDefined();
  });

  describe("list", () => {
    it("devuelve data y pagination sin filtros", async () => {
      prisma.problem.findMany.mockResolvedValue([
        { id: "1", title: "Two Sum" },
      ]);
      prisma.problem.count.mockResolvedValue(1);

      const result = await service.list({ limit: 20, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(prisma.problem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {}, take: 20, skip: 0 }),
      );
    });

    it("filtra platform cuando se especifíca", async () => {
      prisma.problem.findMany.mockResolvedValue([]);
      prisma.problem.count.mockResolvedValue(0);

      await service.list({
        platform: Platform.Codeforces,
        limit: 20,
        offset: 0,
      });

      expect(prisma.problem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { platform: Platform.Codeforces },
        }),
      );
    });

    it("filtra por tags usando problemTags.some", async () => {
      prisma.problem.findMany.mockResolvedValue([]);
      prisma.problem.count.mockResolvedValue(0);

      await service.list({ tags: ["dp", "graphs"], limit: 20, offset: 0 });

      expect(prisma.problem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            problemTags: {
              some: { tag: { name: { in: ["dp", "graphs"] } } },
            },
          }),
        }),
      );
    });

    describe("findOne", () => {
      it("devuelve el problema si existe", async () => {
        const fakeProblem = { id: "abc", title: "Two Sum" };
        prisma.problem.findUnique.mockResolvedValue(fakeProblem);

        const result = await service.findOne("abc");

        expect(result).toEqual(fakeProblem);
      });

      it("lanza NotFoundException si no existe", async () => {
        prisma.problem.findUnique.mockResolvedValue(null);

        await expect(service.findOne("no-existe")).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
