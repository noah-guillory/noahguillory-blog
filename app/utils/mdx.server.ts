import { LocalMdxFetcher } from "~/utils/mdx-loaders/local.server";
import { compileMdx } from "~/utils/build-mdx.server";
import { GithubMdxFetcher } from "~/utils/mdx-loaders/github.server";
import { cache, cachified } from "~/utils/cache.server";
import type { CachifiedOptions } from "~/utils/interfaces";

const checkCompiledValue = (value: unknown) =>
  typeof value === "object" &&
  (value === null || ("code" in value && "frontmatter" in value));

const defaultTTL = 1000 * 60 * 60 * 24 * 14;
const defaultStaleWhileRevalidate = 1000 * 60 * 60 * 24 * 30;

const mdxFetcher = GithubMdxFetcher;

export async function getMdxPage(
  {
    contentDir,
    slug,
  }: {
    contentDir: string;
    slug: string;
  },
  options: CachifiedOptions
) {
  const { forceFresh, ttl = defaultTTL, request } = options;
  const cacheKey = `mdx-page:${contentDir}:${slug}:compiled`;

  return await cachified({
    key: cacheKey,
    cache,
    request,
    ttl,
    staleWhileRevalidate: defaultStaleWhileRevalidate,
    forceFresh,
    checkValue: checkCompiledValue,
    getFreshValue: async () => {
      const fileContent = await mdxFetcher.getMdxFileCached(
        { contentDir, slug },
        options
      );

      if (!fileContent) {
        throw new Error("File not found");
      }

      return compileMdx(fileContent);
    },
  });
}

export async function getMdxFileList(
  directory: string,
  options: CachifiedOptions
) {
  const { forceFresh, ttl = defaultTTL, request } = options;

  const dirList = await mdxFetcher.getMdxFileListCached(directory, options);

  const pages = await Promise.all(
    dirList.map(async (file) => {
      const page = await getMdxPage({ contentDir: directory, slug: file }, {});
      return {
        ...page,
        slug: file,
      };
    })
  );
  return pages.filter((page) => page.frontmatter.draft !== true);
}
