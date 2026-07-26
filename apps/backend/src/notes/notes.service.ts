import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { createNoteDto } from "./dto/create-note.dto";
import { ListNotesQueryDto } from "./dto/list-notes-query.dto";
import { updateNoteDto } from "./dto/update-note.dto";

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListNotesQueryDto) {
    const repository = await this.prisma.repository.findUnique({
      where: { userId },
    });
    if (!repository) {
      return {
        data: [],
        pagination: { total: 0, limit: query.limit, offset: query.offset },
      };
    }

    const where = {
      repositoryId: repository.id,
      ...(query.problemId && { problemId: query.problemId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        take: query.limit,
        skip: query.offset,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.note.count({ where }),
    ]);

    return {
      data,
      pagination: { total, limit: query.limit, offset: query.offset },
    };
  }
  async create(userId: string, dto: createNoteDto) {
    const repository = await this.prisma.repository.findUnique({
      where: { userId },
    });
    if (!repository) {
      throw new ConflictException(
        "No tienes un repositorio conectado, Conecta primero.",
      );
    }

    const path = `notes/${Date.now()}.md`;

    return this.prisma.note.create({
      data: {
        repositoryId: repository.id,
        problemId: dto.problemId,
        content: dto.content,
        path,
      },
    });
  }

  async remove(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, repository: { userId } },
    });
    if (!note) {
      throw new NotFoundException('Nota no encontrada');
    }
    return this.prisma.note.delete({ where: { id } });
  }
}
