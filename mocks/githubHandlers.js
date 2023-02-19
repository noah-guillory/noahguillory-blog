const fs = require("fs/promises");
const nodePath = require("path");
const { rest } = require("msw");

async function isDirectory(d) {
  try {
    return (await fs.lstat(d)).isDirectory();
  } catch {
    return false;
  }
}
async function isFile(d) {
  try {
    return (await fs.lstat(d)).isFile();
  } catch {
    return false;
  }
}

const githubHandlers = [
  rest.get(
    `https://api.github.com/repos/:owner/:repo/contents/:path`,
    async (req, res, ctx) => {
      const { owner, repo } = req.params;
      if (typeof req.params.path !== "string") {
        throw new Error("req.params.path must be a string");
      }
      const path = decodeURIComponent(req.params.path).trim();
      const isMockable =
        owner === "noah-guillory" &&
        repo === "noahguillory-blog" &&
        path.startsWith("content");

      if (!isMockable) {
        const message = `Attempting to get content description for unmockable resource: ${owner}/${repo}/${path}`;
        console.error(message);
        throw new Error(message);
      }

      const localPath = nodePath.join(__dirname, "..", path);
      const isLocalDir = await isDirectory(localPath);
      const isLocalFile = await isFile(localPath);

      if (!isLocalDir && !isLocalFile) {
        return res(
          ctx.status(404),
          ctx.json({
            message: "Not Found",
            documentation_url:
              "https://docs.github.com/rest/reference/repos#get-repository-content",
          })
        );
      }

      if (isLocalFile) {
        const encoding = "base64";
        const content = await fs.readFile(localPath, { encoding: "utf-8" });
        return res(
          ctx.status(200),
          ctx.json({
            content: Buffer.from(content, "utf-8").toString(encoding),
            encoding,
          })
        );
      }

      const dirList = await fs.readdir(localPath);

      const contentDescriptions = await Promise.all(
        dirList.map(async (name) => {
          const relativePath = nodePath.join(path, name);
          // NOTE: this is a cheat-code so we don't have to determine the sha of the file
          // and our sha endpoint handler doesn't have to do a reverse-lookup.
          const sha = relativePath;
          const fullPath = nodePath.join(localPath, name);
          const isDir = await isDirectory(fullPath);
          const size = isDir ? 0 : (await fs.stat(fullPath)).size;
          return {
            name,
            path: relativePath,
            sha,
            size,
            url: `https://api.github.com/repos/${owner}/${repo}/contents/${path}?${req.url.searchParams}`,
            html_url: `https://github.com/${owner}/${repo}/tree/main/${path}`,
            git_url: `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`,
            download_url: null,
            type: isDir ? "dir" : "file",
            _links: {
              self: `https://api.github.com/repos/${owner}/${repo}/contents/${path}${req.url.searchParams}`,
              git: `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}`,
              html: `https://github.com/${owner}/${repo}/tree/main/${path}`,
            },
          };
        })
      );

      return res(ctx.json(contentDescriptions));
    }
  ),
  rest.get(
    `https://raw.githubusercontent.com/:owner/:repo/:ref/:path`,
    async (req, res, ctx) => {
      const { owner, repo, ref } = req.params;
      if (typeof req.params.path !== "string") {
        throw new Error("req.params.path must be a string");
      }
      const path = decodeURIComponent(req.params.path).trim();

      if (!path.includes("/")) {
        const message = `Attempting to get content for sha, but no sha exists locally: ${path}`;
        console.error(message);
        throw new Error(message);
      }

      const relativePath = path;
      const fullPath = nodePath.join(__dirname, "..", relativePath);
      const content = await fs.readFile(fullPath, { encoding: "utf-8" });

      return res(ctx.text(content.toString()));
    }
  ),
  rest.get(
    `https://api.github.com/repos/:owner/:repo/contents/:path*`,
    async (req, res, ctx) => {
      const { owner, repo } = req.params;

      const relativePath = req.params.path;
      if (typeof relativePath !== "string") {
        throw new Error("req.params.path must be a string");
      }
      const fullPath = nodePath.join(__dirname, "..", relativePath);
      const encoding = "base64";
      const size = (await fs.stat(fullPath)).size;
      const content = await fs.readFile(fullPath, { encoding: "utf-8" });
      const sha = `${relativePath}_sha`;

      const resource = {
        sha,
        node_id: `${req.params.path}_node_id`,
        size,
        url: `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`,
        content: Buffer.from(content, "utf-8").toString(encoding),
        encoding,
      };

      return res(ctx.json(resource));
    }
  ),
];

module.exports = {
  githubHandlers,
};
