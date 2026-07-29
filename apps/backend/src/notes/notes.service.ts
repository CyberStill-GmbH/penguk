import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GithubService } from "../github/github.service";
import { CreateNoteDto } from "./dto/create-note.dto";
import { ListNotesQueryDto } from "./dto/list-notes-query.dto";
import { UpdateNoteDto } from "./dto/update-note.dto";

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly githubService: GithubService,
  ) {}

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
  async create(userId: string, dto: CreateNoteDto) {
    const repository = await this.prisma.repository.findUnique({
      where: { userId },
    });
    if (!repository) {
      throw new ConflictException(
        "No tienes un repositorio conectado, Conecta primero.",
      );
    }

    const path = `notes/${Date.now()}.md`;

    await this.githubService.writeFile(userId, path, dto.content);

    return this.prisma.note.create({
      data: {
        repositoryId: repository.id,
        problemId: dto.problemId,
        content: dto.content,
        path,
      },
    });
  }

  async findOne(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, repository: { userId } },
    });
    if (!note) throw new NotFoundException("Nota no encontrada");
    return note;
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    await this.findOne(userId, id);

    return this.prisma.note.update({
      where: { id },
      data: {
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.problemId !== undefined && { problemId: dto.problemId }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.note.delete({ where: { id } });
  }
}
