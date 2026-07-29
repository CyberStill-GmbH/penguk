import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GithubApiProvider } from "./providers/github-api.provider";

@Injectable()
export class GithubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly githubApi: GithubApiProvider,
  ) {}

  private async getAccessToken(userId: string): Promise<string> {
    const account = await this.prisma.authAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException("No tienes GitHub conectado");
    }

    return account.accessToken;
  }

  async getStatus(userId: string) {
    const account = await this.prisma.authAccount.findUnique({
      where: { userId },
    });
    const repository = await this.prisma.repository.findUnique({
      where: { userId },
    });

    return {
      connected: Boolean(account),
      repositoryConfigured: Boolean(repository),
    };
  }

  async listAvailableRepositories(userId: string) {
    const accessToken = await this.getAccessToken(userId);
    return this.githubApi.listRepositories(accessToken);
  }

  async connectRepository(userId: string, repositoryId: number) {
    const existing = await this.prisma.repository.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException("Ya tienes un repositorio conectado");
    }

    const accessToken = await this.getAccessToken(userId);
    const repos = await this.githubApi.listRepositories(accessToken);
    const target = repos.find((r) => r.id === repositoryId);

    if (!target) {
      throw new NotFoundException(
        "Repositorio no encontrado en tu cuenta de GitHub",
      );
    }

    return this.prisma.repository.create({
      data: {
        userId,
        githubRepositoryId: String(target.id),
        owner: target.owner.login,
        name: target.name,
        defaultBranch: target.default_branch,
        url: target.html_url,
      },
    });
  }

  async createAndConnectRepository(userId: string, name: string) {
    const existing = await this.prisma.repository.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new ConflictException("Ya tienes un repositorio conectado");
    }

    const accessToken = await this.getAccessToken(userId);
    const created = await this.githubApi.createRepository(accessToken, name);

    return this.prisma.repository.create({
      data: {
        userId,
        githubRepositoryId: String(created.id),
        owner: created.owner.login,
        name: created.name,
        defaultBranch: created.default_branch,
        url: created.html_url,
      },
    });
  }

  async disconnectRepository(userId: string) {
    const existing = await this.prisma.repository.findUnique({
      where: { userId },
    });
    if (!existing) {
      throw new NotFoundException("No tienes ningún repositorio conectado");
    }

    await this.prisma.repository.delete({ where: { userId } });
  }

  async writeFile(userId: string, path: string, content: string) {
    const [accessToken, repository] = await Promise.all([
      this.getAccessToken(userId),
      this.prisma.repository.findUniqueOrThrow({ where: { userId } }),
    ]);

    let sha: string | undefined;
    try {
      const existing = await this.githubApi.getFile(
        accessToken,
        repository.owner,
        repository.name,
        path,
      );
      sha = existing.sha;
    } catch {
      sha = undefined;
    }

    await this.githubApi.createOrUpdateFile(
      accessToken,
      repository.owner,
      repository.name,
      path,
      content,
      sha,
    );
  }

  async deleteFile(userId: string, path: string) {
    const [accessToken, repository] = await Promise.all([
      this.getAccessToken(userId),
      this.prisma.repository.findUniqueOrThrow({ where: { userId } }),
    ]);

    const existing = await this.githubApi.getFile(
      accessToken,
      repository.owner,
      repository.name,
      path,
    );

    await this.githubApi.deleteFile(
      accessToken,
      repository.owner,
      repository.name,
      path,
      existing.sha,
    );
  }
}
