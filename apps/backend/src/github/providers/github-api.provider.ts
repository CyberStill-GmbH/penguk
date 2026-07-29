import { Injectable } from "@nestjs/common";
import { GithubRepo } from "../interfaces/github.interfaces";

@Injectable()
export class GithubApiProvider {
  private readonly BASE_URL = "https://api.github.com";

  private async request<T>(
    accessToken: string,
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const response = await fetch(`${this.BASE_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`GitHub API ${response.status}: ${body}`);
    }

    return response.json() as Promise<T>;
  }

  listRepositories(accessToken: string): Promise<GithubRepo[]> {
    return this.request<GithubRepo[]>(accessToken, "/user/repos?per_page=100");
  }

  getRepository(
    accessToken: string,
    owner: string,
    name: string,
  ): Promise<GithubRepo> {
    return this.request<GithubRepo>(accessToken, `/repos/${owner}/${name}`);
  }

  createRepository(accessToken: string, name: string): Promise<GithubRepo> {
    return this.request<GithubRepo>(accessToken, "/user/repos", {
      method: "POST",
      body: JSON.stringify({ name, private: true, auto_init: true }),
    });
  }

  createOrUpdateFile(
    accessToken: string,
    owner: string,
    repo: string,
    path: string,
    content: string,
    sha?: string,
  ): Promise<{ content: { sha: string } }> {
    return this.request(
      accessToken,
      `/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        body: JSON.stringify({
          message: sha ? `Update ${path}` : `Create ${path}`,
          content: Buffer.from(content).toString("base64"),
          ...(sha && { sha }),
        }),
      },
    );
  }

  deleteFile(
    accessToken: string,
    owner: string,
    repo: string,
    path: string,
    sha: string,
  ): Promise<void> {
    return this.request(
      accessToken,
      `/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "DELETE",
        body: JSON.stringify({ message: `Delete ${path}`, sha }),
      },
    );
  }

  getFile(
    accessToken: string,
    owner: string,
    repo: string,
    path: string,
  ): Promise<{ sha: string; content: string }> {
    return this.request(
      accessToken,
      `/repos/${owner}/${repo}/contents/${path}`,
    );
  }
}
