import type { CachifiedOptions, IMdxFetcher } from "~/utils/interfaces";
import fs from "fs/promises";

const BASE_DIR = "/Users/noah/Projects/noahguillory-blog/content";
export const LocalMdxFetcher: IMdxFetcher = class {
  static async getMdxFileCached(
    {
      contentDir,
      slug,
    }: {
      contentDir: string;
      slug: string;
    },
    options: CachifiedOptions
  ): Promise<string | null> {
    try {
      const fileContents = await fs.readFile(
        `${BASE_DIR}/${contentDir}/${slug}.mdx`
      );
      const stringContent = fileContents.toString("utf8");

      return stringContent;
    } catch (e) {
      const error = e as Error;
      if (error.message.includes("ENOENT")) {
        return null;
      } else {
        throw e;
      }
    }
  }

  static async getMdxFileListCached(
    directory: string,
    options: CachifiedOptions
  ): Promise<string[]> {
    try {
      const list = await fs.readdir(`${BASE_DIR}/${directory}`);
      return list.map((fileName) => fileName.replace(/\.mdx$/, ""));
    } catch (e) {
      console.error(e);
      return [];
    }
  }
};
