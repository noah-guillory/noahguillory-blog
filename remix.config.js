/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  serverDependenciesToBundle: [
    "mdx-bundler",
    "rehype-highlight",
    "lowlight",
    "hast-util-to-text",
    "unist-util-visit",
    "fault",
    "hast-util-is-element",
    "unist-util-visit-parents",
    "unist-util-find-after",
    "unist-util-is",
  ],
  ignoredRouteFiles: ["**/.*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
};
