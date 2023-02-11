declare class _IMdxFetcher {
  static getMdxFile({
    contentDir,
    slug,
  }: {
    contentDir: string;
    slug: string;
  }): Promise<string | null>;

  static getMdxFileList(directory: string): Promise<string[]>;
}

export type IMdxFetcher = typeof _IMdxFetcher;
