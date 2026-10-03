import type { Project } from "./content";

const GITHUB_API_URL = "https://api.github.com/repos";
const GITHUB_RAW_URL = "https://raw.githubusercontent.com";
const REQUEST_TIMEOUT_MS = 5_000;

interface GitHubRepository {
  description: string | null;
  html_url: string;
  full_name: string;
  stargazers_count: number;
}

const repositoryRequests = new Map<string, Promise<GitHubRepository | null>>();
const readmeRequests = new Map<string, Promise<string | null>>();

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
    (typeof repository.description === "string" || repository.description === null) &&
    hasValidUrl &&
    typeof repository.full_name === "string" && /^[\w.-]+\/[\w.-]+$/.test(repository.full_name) &&
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

async function fetchGitHubReadme(repository: string): Promise<string | null> {
  try {
    const response = await fetch(`${GITHUB_RAW_URL}/${repository}/HEAD/README.md`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) return null;
    return response.text();
  } catch {
    return null;
  }
}

function getGitHubReadme(repository: string): Promise<string | null> {
  const request = readmeRequests.get(repository);
  if (request) return request;

  const nextRequest = fetchGitHubReadme(repository);
  readmeRequests.set(repository, nextRequest);
  return nextRequest;
}

function getFirstReadmeImage(markdown: string): string | null {
  const markdownImage = /!\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))[^)]*\)/.exec(markdown);
  const htmlImage = /<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)')/i.exec(markdown);
  const matches = [markdownImage, htmlImage]
    .filter((match): match is RegExpExecArray => match !== null)
    .sort((a, b) => a.index - b.index);
  const match = matches[0];

  return match?.[1] ?? match?.[2] ?? null;
}

function getReadmeImageUrl(repository: string, markdown: string): string | null {
  const image = getFirstReadmeImage(markdown);
  if (!image || image.startsWith("data:")) return null;

  try {
    if (image.startsWith("/")) {
      return new URL(
        image.slice(1),
        `${GITHUB_RAW_URL}/${repository}/HEAD/`,
      ).toString();
    }

    const readmeUrl = new URL("README.md", `${GITHUB_RAW_URL}/${repository}/HEAD/`);
    return new URL(image, readmeUrl).toString();
  } catch {
    return null;
  }
}

export async function syncGitHubProject(project: Project): Promise<Project> {
  const repositoryName = project.data.githubRepository;
  if (!repositoryName) return project;

  const [repository, readme] = await Promise.all([
    getGitHubRepository(repositoryName),
    getGitHubReadme(repositoryName),
  ]);
  const image = readme ? getReadmeImageUrl(repositoryName, readme) : undefined;
  if (!repository && !image) return project;

  return {
    ...project,
    data: {
      ...project.data,
      ...(repository ? {
        description: repository.description ?? project.data.description,
        link: repository.html_url,
        githubStars: repository.stargazers_count,
      } : {}),
      ...(image ? { image } : {}),
    },
  };
}
