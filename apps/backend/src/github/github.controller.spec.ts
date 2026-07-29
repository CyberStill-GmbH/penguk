import { GithubController } from "./github.controller";
import { GithubService } from "./github.service";

describe("GithubController", () => {
  let controller: GithubController;
  const githubService = {
    getStatus: vi.fn(),
    listAvailableRepositories: vi.fn(),
    createAndConnectRepository: vi.fn(),
    connectRepository: vi.fn(),
    disconnectRepository: vi.fn(),
  };
  const request = { user: { userId: "user-id", email: "user@example.com" } };

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new GithubController(
      githubService as unknown as GithubService,
    );
  });

  it("uses the authenticated user to select a repository", async () => {
    await controller.selectRepository(request as never, { repositoryId: 7 });

    expect(githubService.connectRepository).toHaveBeenCalledWith("user-id", 7);
  });

  it("passes repository creation requests to the service", async () => {
    await controller.createRepository(request as never, { name: "study-notes" });

    expect(githubService.createAndConnectRepository).toHaveBeenCalledWith(
      "user-id",
      "study-notes",
    );
  });

  it("waits for repository disconnection", async () => {
    githubService.disconnectRepository.mockResolvedValue(undefined);

    await controller.disconnect(request as never);

    expect(githubService.disconnectRepository).toHaveBeenCalledWith("user-id");
  });
});
