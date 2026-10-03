import type { Project } from "./content";

const GITHUB_API_URL = "https://api.github.com/repos";
const GITHUB_SOCIAL_IMAGE_URL = "https://opengraph.githubassets.com";
const REQUEST_TIMEOUT_MS = 5_000;

interface GitHubRepository {
  name: string;
  description: string | null;
  html_url: string;
  full_name: string;
  updated_at: string;
  stargazers_count: number;
}

const repositoryRequests = new Map<string, Promise<GitHubRepository | null>>();

function isGitHubRepository(value: unknown): value is GitHubRepository {
  if (!value || typeof value !== "object") return false;

  const repository = value as Record<string, unknown>;
  const hasValidUrl = typeof repository.html_url === "string" && (() => {
    try {
      return new URL(repository.html_url).hostname === "github.com";
    } catch {
      return false;
    }
  })();

  return (
    typeof repository.name === "string" && repository.name.length > 0 &&
    (typeof repository.description === "string" || repository.description === null) &&
    hasValidUrl &&
    typeof repository.full_name === "string" && /^[\w.-]+\/[\w.-]+$/.test(repository.full_name) &&
    typeof repository.updated_at === "string" && !Number.isNaN(Date.parse(repository.updated_at)) &&
    typeof repository.stargazers_count === "number" && Number.isSafeInteger(repository.stargazers_count) && repository.stargazers_count >= 0
  );
}

async function fetchGitHubRepository(repository: string): Promise<GitHubRepository | null> {
  try {
    const response = await fetch(`${GITHUB_API_URL}/${repository}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const result: unknown = await response.json();
    return isGitHubRepository(result) ? result : null;
  } catch {
    return null;
  }
}

function getGitHubRepository(repository: string): Promise<GitHubRepository | null> {
  const request = repositoryRequests.get(repository);
  if (request) return request;

  const nextRequest = fetchGitHubRepository(repository);
  repositoryRequests.set(repository, nextRequest);
  return nextRequest;
}

function getSocialImageUrl(repository: GitHubRepository): string {
  const cacheKey = encodeURIComponent(repository.updated_at);
  return `${GITHUB_SOCIAL_IMAGE_URL}/${cacheKey}/${repository.full_name}`;
}

export async function syncGitHubProject(project: Project): Promise<Project> {
  const repositoryName = project.data.githubRepository;
  if (!repositoryName) return project;

  const repository = await getGitHubRepository(repositoryName);
  if (!repository) return project;

  return {
    ...project,
    data: {
      ...project.data,
      description: repository.description ?? project.data.description,
      link: repository.html_url,
      image: getSocialImageUrl(repository),
      githubStars: repository.stargazers_count,
    },
  };
}
