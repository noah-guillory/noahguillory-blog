declare class _IMdxFetcher {
  static getMdxFileCached(
    {
      contentDir,
      slug,
    }: {
      contentDir: string;
      slug: string;
    },
    options: CachifiedOptions
  ): Promise<string | null>;

  static getMdxFileListCached(
    directory: string,
    options: CachifiedOptions
  ): Promise<string[]>;
}

export type IMdxFetcher = typeof _IMdxFetcher;

export type CachifiedOptions = {
  forceFresh?: boolean | string;
  request?: Request;
  ttl?: number;
};
