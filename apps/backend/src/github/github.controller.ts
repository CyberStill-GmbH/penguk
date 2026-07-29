import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Req,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { Request } from "express";
import { GithubService } from "./github.service";
import { SelectRepositoryDto } from "./dto/select-repository.dto";
import { CreateRepositoryDto } from "./dto/create-repository.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";

export interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller("github")
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get("status")
  getStatus(@Req() req: AuthenticatedRequest) {
    return this.githubService.getStatus(req.user.userId);
  }

  @Get("repositories")
  listRepositories(@Req() req: AuthenticatedRequest) {
    return this.githubService.listAvailableRepositories(req.user.userId);
  }

  @Post("repositories")
  createRepository(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateRepositoryDto,
  ) {
    return this.githubService.createAndConnectRepository(
      req.user.userId,
      dto.name,
    );
  }

  @Put("repository")
  selectRepository(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SelectRepositoryDto,
  ) {
    return this.githubService.connectRepository(
      req.user.userId,
      dto.repositoryId,
    );
  }

  @Delete("repository")
  @HttpCode(204)
  async disconnect(@Req() req: AuthenticatedRequest) {
    await this.githubService.disconnectRepository(req.user.userId);
  }
}
