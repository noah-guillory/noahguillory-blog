const { setupServer } = require("msw/node");
const { githubHandlers } = require("./handlers/githubHandlers");

const server = setupServer(...githubHandlers);

server.listen({ onUnhandledRequest: "bypass" });
console.info("🔶 Mock server running");

process.once("SIGINT", () => server.close());
process.once("SIGTERM", () => server.close());
