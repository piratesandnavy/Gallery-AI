import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import artistApplication from "./api/artist-application.mjs";
import chat from "./api/chat.mjs";
import contact from "./api/contact.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const builtDirectory = path.join(root, "dist", "client");
const publicDirectory = existsSync(path.join(builtDirectory, "index.html"))
  ? builtDirectory
  : path.join(root, "public");
const port = Number(process.env.PORT || 3000);
const maximumBodySize = 1024 * 1024;

const pageRoutes = new Map([
  ["/", "live-root.html"],
  ["/gallery-ai", "index.html"],
  ["/gallery-ai/", "index.html"],
  ["/gallery-ai/artist-application", "live-artist-application.html"],
  ["/gallery-ai/artist-application/", "live-artist-application.html"],
]);

const contentTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maximumBodySize) throw new Error("REQUEST_TOO_LARGE");
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function runApiHandler(handler, request, response) {
  try {
    request.body = await readJson(request);
  } catch (error) {
    const status = error.message === "REQUEST_TOO_LARGE" ? 413 : 400;
    sendJson(response, status, { error: status === 413 ? "Request is too large." : "Invalid JSON." });
    return;
  }

  response.status = (statusCode) => {
    response.statusCode = statusCode;
    return response;
  };
  response.json = (value) => {
    if (!response.hasHeader("Content-Type")) response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(value));
  };
  await handler(request, response);
}

function safePublicPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const candidate = path.resolve(publicDirectory, `.${decoded}`);
  return candidate.startsWith(`${publicDirectory}${path.sep}`) ? candidate : null;
}

function serveFile(file, request, response) {
  if (!file || !existsSync(file) || !statSync(file).isFile()) return false;
  const headers = { "Content-Type": contentTypes[path.extname(file).toLowerCase()] || "application/octet-stream" };
  if (file.includes(`${path.sep}assets${path.sep}`)) headers["Cache-Control"] = "public, max-age=31536000, immutable";
  response.writeHead(200, headers);
  if (request.method === "HEAD") response.end();
  else createReadStream(file).pipe(response);
  return true;
}

export function createGalleryServer() {
  return createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname === "/healthz") return sendJson(response, 200, { ok: true });
    if (url.pathname === "/api/contact") return runApiHandler(contact, request, response);
    if (url.pathname === "/api/artist-application") return runApiHandler(artistApplication, request, response);
    if (url.pathname === "/api/chat") return runApiHandler(chat, request, response);
    if (!["GET", "HEAD"].includes(request.method)) return sendJson(response, 405, { error: "Method not allowed" });

    const page = pageRoutes.get(url.pathname);
    if (page && serveFile(path.join(publicDirectory, page), request, response)) return;
    if (serveFile(safePublicPath(url.pathname), request, response)) return;
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createGalleryServer().listen(port, "0.0.0.0", () => console.log(`Gallery AI website listening on port ${port}`));
}
