import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { Request } from "express";
import { NotesService } from "./notes.service";
import { createNoteDto } from "./dto/create-note.dto";
import { updateNoteDto } from "./dto/update-note.dto";
import { ListNotesQueryDto } from "./dto/list-notes-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller("notes")
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest, @Query() query: ListNotesQueryDto) {
    return this.notesService.list(req.user.userId, query);
  }

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: createNoteDto) {
    return this.notesService.create(req.user.userId, dto);
  }

  @Patch(":id")
  update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: updateNoteDto,
  ) {
    return this.notesService.update(req.user.userId, id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.notesService.remove(req.user.userId, id);
  }
}
