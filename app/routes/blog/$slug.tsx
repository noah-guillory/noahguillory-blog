import type { LoaderArgs, MetaFunction, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";
import { getMdxPage } from "~/utils/mdx.server";
import { getMDXComponent } from "mdx-bundler/client";
import highlightJsStylesheetUrl from "highlight.js/styles/github-dark.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: highlightJsStylesheetUrl }];
};

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.slug, "Slug not found");

  const page = await getMdxPage(
    { contentDir: "blog", slug: params.slug },
    { request }
  );

  if (!page) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  return json({
    page,
  });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return {
    title: data.page.frontmatter.title,
    description: data.page.frontmatter.subtitle,
  };
};

export default function BlogPostPage() {
  const { page } = useLoaderData<typeof loader>();
  const { frontmatter, code } = page;
  const Component = getMDXComponent(code);
  return (
    <article className="format mx-auto mt-8 text-gray-900 lg:format-lg">
      <h1>{page.frontmatter.title}</h1>
      <Component />
    </article>
  );
}

export function CatchBoundary() {
  return (
    <div>
      <h2>Post not found</h2>
    </div>
  );
}
