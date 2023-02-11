const REF = "main";
const REPOSITORY = "noahguillory-blog";
const OWNER = "noah-guillory";

const rawGithubFileUrl = ({
                            owner,
                            repo,
                            ref,
                            path
                          }: {
  owner: string;
  repo: string;
  ref: string;
  path: string;
}) => `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;

export async function downloadFile({
                                     contentDir,
                                     slug
                                   }: {
  contentDir: string;
  slug: string;
}) {
  const fileUrl = rawGithubFileUrl({
    owner: OWNER,
    repo: REPOSITORY,
    ref: REF,
    path: `${contentDir}/${slug}`
  });

  const response = await fetch(fileUrl);

  if (response.status === 404) {
    throw new Error(`File at URL ${fileUrl} not found`);
  }

  return await response.text();
}
