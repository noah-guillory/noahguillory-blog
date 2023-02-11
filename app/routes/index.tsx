import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getMdxFileList } from "~/utils/mdx.server";

export async function loader({ request, params }: LoaderArgs) {
  const postList = await getMdxFileList("/blog");

  return json({
    postList
  });
}

export default function Index() {
  const { postList } = useLoaderData<typeof loader>();

  return (
    <main>
      <header className="container mx-auto w-full">
        <div className="flex flex-col items-center py-12">
          <Link
            className="text-5xl font-bold uppercase text-gray-800 hover:text-gray-700"
            to="/"
          >
            Noah's Blog
          </Link>
          <p className="text-lg text-gray-600">
            My musings and various projects that I'm working on
          </p>
        </div>
      </header>

      <div className="container mx-auto flex flex-wrap py-6">
        <section className="flex w-full flex-col items-center px-3">
          {postList.map((post) => (
            <article
              className="my-4 flex flex-col shadow"
              key={post.frontmatter.title}
            >
              <Link
                className="text-3xl font-bold hover:text-gray-700"
                to={`/blog/${post.slug}`}
              >
                {post.frontmatter.title}
              </Link>
              <Link to={`/blog/${post.slug}`} className="pb-3 text-sm">
                By Noah, Published on April 25th, 2020
              </Link>
              <p className="pb-6">{post.frontmatter.subtitle}</p>
              <Link
                className="uppercase text-gray-800 hover:text-black"
                to={`/blog/${post.slug}`}
              >
                Continue Reading
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
