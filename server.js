const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "8088", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Bind the port immediately so readiness checks pass while Next.js compiles.
const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  await handle(req, res, parsedUrl);
});

server.listen(port, hostname, () => {
  console.log(`> Listening on http://${hostname}:${port}`);
});

app.prepare().then(() => {
  console.log("> Next.js ready");
});
