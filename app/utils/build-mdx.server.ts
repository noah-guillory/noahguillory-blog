import { bundleMDX } from "mdx-bundler";
import rehypeHighlight from "rehype-highlight";
import type * as M from "mdast";
import { envMust } from "~/utils/utils";

export async function compileMdx(source: string) {
  return bundleMDX<FrontMatter>({
    source,
    mdxOptions(options, frontmatter) {
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        autoAffiliates,
      ];
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeHighlight,
      ];

      return options;
    },
  });
}

function autoAffiliates() {
  return async function affiliateTransformer(tree: M.Root) {
    const { visit } = await import("unist-util-visit");
    visit(tree, "link", function visitor(linkNode: M.Link) {
      if (linkNode.url.includes("amazon.com")) {
        const amazonUrl = new URL(linkNode.url);
        if (!amazonUrl.searchParams.has("tag")) {
          amazonUrl.searchParams.set("tag", envMust("AMAZON_ASSOCIATE_ID"));
          linkNode.url = amazonUrl.toString();
        }
      }
    });
  };
}

export type FrontMatter = {
  title: string;
  subtitle: string;
  publishDate: Date;
  draft: boolean;
};
