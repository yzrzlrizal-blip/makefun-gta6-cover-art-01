// serve.ts — a tiny static server for trying the app locally.
// Serves app/ over HTTP so the browser can load its modules.
//
//   node serve.ts [port]        (default port 8901)

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = resolve(
  join(fileURLToPath(new URL(".", import.meta.url)), "app"),
);
const port = Number(process.argv[2] || process.env.PORT || 8901);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
};

const server = createServer(async (req, res) => {
  try {
    const path = normalize(
      decodeURIComponent(new URL(req.url || "/", "http://x").pathname),
    ).replace(/^(\.\.[/\\])+/, "");
    let file = join(appDir, path);
    if (path === "/" || path === sep) file = join(appDir, "index.html");
    if (!file.startsWith(appDir)) throw new Error("outside app/");
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    res.writeHead(200, {
      "content-type": types[extname(file)] || "application/octet-stream",
      "content-length": info.size,
    });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found\n");
  }
});

server.listen(port, () => {
  console.log(`Vice Cover Studio at http://localhost:${port}/`);
});
