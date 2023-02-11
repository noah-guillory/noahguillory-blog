import { LocalMdxFetcher } from "~/utils/mdx-loaders/local.server";
import { compileMdx } from "~/utils/build-mdx.server";
import { GithubMdxFetcher } from "~/utils/mdx-loaders/github.server";

const mdxFetcher = process.env.NODE_ENV === 'production' ? GithubMdxFetcher : LocalMdxFetcher;

export async function getMdxPage({
  contentDir,
  slug,
}: {
  contentDir: string;
  slug: string;
}) {
  const fileContent = await mdxFetcher.getMdxFile({ contentDir, slug });

  if (!fileContent) {
    throw new Error("File not found");
  }

  return compileMdx(fileContent);
}

export async function getMdxFileList(directory: string) {
  const dirList = await mdxFetcher.getMdxFileList(directory);

  return await Promise.all(
    dirList.map(async (file) => {
      const page = await getMdxPage({ contentDir: directory, slug: file });
      return {
        ...page,
        slug: file,
      };
    })
  );
}
