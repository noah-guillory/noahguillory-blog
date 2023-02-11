import type { IMdxFetcher } from "~/utils/interfaces";
import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REF = "main";
const REPOSITORY = "noahguillory-blog";
const OWNER = "noah-guillory";

const rawGithubFileUrl = ({
  owner,
  repo,
  ref,
  path,
}: {
  owner: string;
  repo: string;
  ref: string;
  path: string;
}) => `https://raw.githubusercontent.com/${owner}/${repo}/${ref}${path}`;

export async function downloadFile({
  contentDir,
  slug,
}: {
  contentDir: string;
  slug: string;
}) {
  const fileUrl = rawGithubFileUrl({
    owner: OWNER,
    repo: REPOSITORY,
    ref: REF,
    path: `/content${contentDir}/${slug}.mdx`,
  });

  const response = await fetch(fileUrl);
  if (response.status === 404) {
    throw new Error(`File at URL ${fileUrl} not found`);
  }

  return await response.text();
}

export const GithubMdxFetcher: IMdxFetcher = class {
  static async getMdxFile({
    contentDir,
    slug,
  }: {
    contentDir: string;
    slug: string;
  }): Promise<string | null> {
    try {
      const fileContents = await downloadFile({ contentDir, slug });

      return fileContents;
    } catch (e) {
      const error = e as Error;
      if (error.message.includes("not found")) {
        return null;
      } else {
        throw e;
      }
    }
  }

  static async getMdxFileList(directory: string): Promise<string[]> {
    try {
      const response = await octokit.rest.repos.getContent({
        owner: OWNER,
        repo: REPOSITORY,
        path: `content${directory}`,
      });

      // @ts-ignore
      return response.data
        .filter((item: { type: string }) => item.type === "file")
        .map((file: { name: string }) => file.name.replace(/\.mdx$/, ""));
    } catch (e) {
      console.error(e);
      return [];
    }
  }
};
