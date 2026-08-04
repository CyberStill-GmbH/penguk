import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ListProblemsQueryDto } from "./dto/list-problems.dto";

@Injectable()
export class ProblemsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListProblemsQueryDto) {
    const where = {
      ...(query.platform && { platform: query.platform }),
      ...(query.difficulty && { difficulty: query.difficulty }),
      ...(query.tags?.length && {
        problemTags: {
          some: {
            tag: { name: { in: query.tags } },
          },
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.problem.findMany({
        where,
        take: query.limit,
        skip: query.offset,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.problem.count({ where }),
    ]);

    return {
      data,
      pagination: { total, limit: query.limit, offset: query.offset },
    };
  }

  async findOne(id: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
    });
    if (!problem) {
      throw new NotFoundException("Problema no encontrado");
    }
    return problem;
  }
}
