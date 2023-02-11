import { bundleMDX } from "mdx-bundler";
import { LocalMdxFetcher } from "~/utils/local.server";

export type FrontMatter = {
  title: string;
  subtitle: string;
};

export async function getMdxPage({
                                   contentDir,
                                   slug
                                 }: {
  contentDir: string;
  slug: string;
}) {
  // const rawFile = await downloadFile({contentDir, slug});
  // return await bundleMDX<FrontMatter>({
  //   source: rawFile,
  // })

  const fileContent = await LocalMdxFetcher.getMdxFile({ contentDir, slug });

  if (!fileContent) {
    throw new Error("File not found");
  }

  return bundleMDX<FrontMatter>({
    source: fileContent
  });
}

export async function getMdxFileList(directory: string) {
  const dirList = await LocalMdxFetcher.getMdxFileList(directory);

  return await Promise.all(
    dirList.map(async (file) => {
      const page = await getMdxPage({ contentDir: directory, slug: file });
      return {
        ...page,
        slug: file
      };
    })
  );
}
