import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = new URL("../dist/", import.meta.url).pathname;
const base = "/claude-certification-study-kit";
const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };

createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  let pathname = decodeURIComponent(url.pathname);
  if (!pathname.startsWith(base)) { response.writeHead(404).end("Not found"); return; }
  pathname = pathname.slice(base.length) || "/";
  const relative = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, "").replace(/^\//, "");
  let file = join(root, relative);
  try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); } catch { if (!extname(file)) file = join(file, "index.html"); }
  try {
    const info = await stat(file);
    if (!info.isFile() || !file.startsWith(root)) throw new Error("Not found");
    response.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(response);
  } catch { response.writeHead(404, { "Content-Type": "text/plain" }).end("Not found"); }
}).listen(4321, "127.0.0.1", () => console.log(`Serving ${root} at http://127.0.0.1:4321${base}/`));
