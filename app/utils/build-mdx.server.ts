import { bundleMDX } from "mdx-bundler";
import rehypeHighlight from "rehype-highlight";

export async function compileMdx(source: string) {
  return bundleMDX<FrontMatter>({
    source,
    mdxOptions(options, frontmatter) {
      options.remarkPlugins = [...(options.remarkPlugins ?? [])];
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeHighlight,
      ];

      return options;
    },
  });
}

export type FrontMatter = {
  title: string;
  subtitle: string;
  publishDate: Date;
};
