import type { CachifiedOptions, IMdxFetcher } from "~/utils/interfaces";
import { Octokit } from "octokit";
import { cachified, lruCache } from "~/utils/cache.server";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REF = "main";
const REPOSITORY = "noahguillory-blog";
const OWNER = "noah-guillory";

const defaultTTL = 1000 * 60 * 60 * 24 * 14
const defaultStaleWhileRevalidate = 1000 * 60 * 60 * 24 * 30

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
  static async getMdxFileCached({
    contentDir,
    slug,
  }: {
    contentDir: string;
    slug: string;
  }, options: CachifiedOptions): Promise<string | null> {

    const key = `mdx-file:${contentDir}:${slug}:download`;

    return await cachified({
      ...options,
      ttl: defaultTTL,
      staleWhileRevalidate: defaultStaleWhileRevalidate,
      key,
      cache: lruCache,
      checkValue: (value: unknown) => {
        if (typeof value !== 'string') {
          return 'value is not a string';
        }

        return true
      },
      getFreshValue: async () => {
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
    })


  }

  static async getMdxFileListCached(directory: string, options: CachifiedOptions): Promise<string[]> {
    const key = `mdx-file:${directory}:file-list`;

    return await cachified({
      ...options,
      key,
      ttl: defaultTTL,
      staleWhileRevalidate: defaultStaleWhileRevalidate,
      cache: lruCache,
      getFreshValue: async () => {
        try {
          const response = await octokit.rest.repos.getContent({
            owner: OWNER,
            repo: REPOSITORY,
            path: `content${directory}`,
          });

          return (
            response.data
              // @ts-ignore
              .filter((item: { type: string }) => item.type === "file")
              .map((file: { name: string }) => file.name.replace(/\.mdx$/, ""))
          );
        } catch (e) {
          console.error(e);
          return [];
        }
      }
    })


  }
};
