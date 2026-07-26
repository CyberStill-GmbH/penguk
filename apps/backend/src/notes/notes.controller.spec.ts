import { Test, TestingModule } from "@nestjs/testing";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createNoteDto } from "./dto/create-note.dto";
import { updateNoteDto } from "./dto/update-note.dto";
import { ListNotesQueryDto } from "./dto/list-notes-query.dto";

describe("NotesController", () => {
  let controller: NotesController;
  let service: NotesService;

  beforeEach(async () => {
    const mockService = {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [{ provide: NotesService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotesController>(NotesController);
    service = module.get<NotesService>(NotesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("list", () => {
    const req = { user: { userId: "u1", email: "a@b.c" } } as any;
    const query = {} as ListNotesQueryDto;
    const result = { data: [], pagination: { total: 0, limit: 10, offset: 0 } };
    vi.spyOn(service, "list").mockReturnValue(result as any);
    expect(controller.list(req, query)).toBe(result);
    expect(service.list).toHaveBeenCalledWith("u1", query);
  });

  it("create", () => {
    const req = { user: { userId: "u1", email: "a@b.c" } } as any;
    const dto: createNoteDto = { problemId: "p1", content: "c" };
    const created = { id: "n1" } as any;
    vi.spyOn(service, "create").mockReturnValue(created);
    expect(controller.create(req, dto)).toBe(created);
    expect(service.create).toHaveBeenCalledWith("u1", dto);
  });

  it("update", () => {
    const req = { user: { userId: "u1", email: "a@b.c" } } as any;
    const dto: updateNoteDto = { content: "new" };
    const updated = { id: "n1" } as any;
    vi.spyOn(service, "update").mockReturnValue(updated);
    expect(controller.update(req, "n1", dto)).toBe(updated);
    expect(service.update).toHaveBeenCalledWith("u1", "n1", dto);
  });

  it("remove", async () => {
    const req = { user: { userId: "u1", email: "a@b.c" } } as any;
    const removed = { id: "n1" } as any;
    vi.spyOn(service, "remove").mockResolvedValue(removed);
    expect(await controller.remove(req, "n1")).toBe(removed);
    expect(service.remove).toHaveBeenCalledWith("u1", "n1");
  });
});
