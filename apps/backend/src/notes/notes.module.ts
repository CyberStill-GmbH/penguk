import { Module } from "@nestjs/common";
import { NotesController } from "./notes.controller";
import { NotesService } from "./notes.service";
import { PrismaModule } from "../prisma/prisma.module";
import { GithubModule } from "../github/github.module";

@Module({
  imports: [PrismaModule, GithubModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
