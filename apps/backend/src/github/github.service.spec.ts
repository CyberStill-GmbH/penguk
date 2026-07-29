import { ConflictException, NotFoundException } from "@nestjs/common";
import { GithubService } from "./github.service";
import { PrismaService } from "../prisma/prisma.service";
import { GithubApiProvider } from "./providers/github-api.provider";

describe("GithubService", () => {
  let service: GithubService;
  const prisma = {
    authAccount: { findUnique: vi.fn() },
    repository: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  };
  const githubApi = {
    listRepositories: vi.fn(),
    createRepository: vi.fn(),
    getFile: vi.fn(),
    createOrUpdateFile: vi.fn(),
    deleteFile: vi.fn(),
  };
  const userId = "user-id";
  const account = { accessToken: "access-token" };
  const repository = { id: "repository-id", owner: "octocat", name: "notes" };
  const remoteRepository = {
    id: 1,
    name: "notes",
    owner: { login: "octocat" },
    default_branch: "main",
    html_url: "https://github.com/octocat/notes",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    service = new GithubService(
      prisma as unknown as PrismaService,
      githubApi as unknown as GithubApiProvider,
    );
  });

  it("returns the connection status", async () => {
    prisma.authAccount.findUnique.mockResolvedValue(account);
    prisma.repository.findUnique.mockResolvedValue(repository);

    await expect(service.getStatus(userId)).resolves.toEqual({
      connected: true,
      repositoryConfigured: true,
    });
  });

  it("rejects repository selection when GitHub is not connected", async () => {
    prisma.repository.findUnique.mockResolvedValue(null);
    prisma.authAccount.findUnique.mockResolvedValue(null);

    await expect(service.connectRepository(userId, 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(githubApi.listRepositories).not.toHaveBeenCalled();
  });

  it("connects an available GitHub repository", async () => {
    prisma.repository.findUnique.mockResolvedValue(null);
    prisma.authAccount.findUnique.mockResolvedValue(account);
    githubApi.listRepositories.mockResolvedValue([remoteRepository]);
    prisma.repository.create.mockResolvedValue({ id: "repository-id" });

    await expect(service.connectRepository(userId, 1)).resolves.toEqual({
      id: "repository-id",
    });
    expect(prisma.repository.create).toHaveBeenCalledWith({
      data: {
        userId,
        githubRepositoryId: "1",
        owner: "octocat",
        name: "notes",
        defaultBranch: "main",
        url: "https://github.com/octocat/notes",
      },
    });
  });

  it("does not replace an existing repository", async () => {
    prisma.repository.findUnique.mockResolvedValue(repository);

    await expect(service.connectRepository(userId, 1)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("updates a file using its existing SHA", async () => {
    prisma.authAccount.findUnique.mockResolvedValue(account);
    prisma.repository.findUniqueOrThrow.mockResolvedValue(repository);
    githubApi.getFile.mockResolvedValue({ sha: "existing-sha" });

    await service.writeFile(userId, "notes/one.md", "content");

    expect(githubApi.createOrUpdateFile).toHaveBeenCalledWith(
      "access-token",
      "octocat",
      "notes",
      "notes/one.md",
      "content",
      "existing-sha",
    );
  });

  it("creates a file when it does not exist yet", async () => {
    prisma.authAccount.findUnique.mockResolvedValue(account);
    prisma.repository.findUniqueOrThrow.mockResolvedValue(repository);
    githubApi.getFile.mockRejectedValue(new Error("not found"));

    await service.writeFile(userId, "notes/one.md", "content");

    expect(githubApi.createOrUpdateFile).toHaveBeenCalledWith(
      "access-token",
      "octocat",
      "notes",
      "notes/one.md",
      "content",
      undefined,
    );
  });
});
