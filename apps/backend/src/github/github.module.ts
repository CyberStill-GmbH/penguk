import { Module } from "@nestjs/common";
import { GithubService } from "./github.service";
import { GithubController } from "./github.controller";
import { GithubApiProvider } from "./providers/github-api.provider";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [GithubController],
  providers: [GithubService, GithubApiProvider],
  exports: [GithubService],
})
export class GithubModule {}
