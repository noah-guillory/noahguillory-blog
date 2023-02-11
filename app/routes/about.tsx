import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getMdxPage } from "~/utils/mdx.server";
import { useLoaderData } from "@remix-run/react";
import { getMDXComponent } from "mdx-bundler/client";

export async function loader({ request, params }: LoaderArgs) {
  const page = await getMdxPage({ contentDir: "/about", slug: "about_me" });

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
    title: "About Me",
    description: "A rundown about Noah",
  };
};

export default function AboutPage() {
  const { page } = useLoaderData<typeof loader>();
  const { code } = page;
  const Component = getMDXComponent(code);
  return (
    <article className="format mx-auto mt-8 text-gray-900 lg:format-lg">
      <Component />
    </article>
  );
}