import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

function productionRoutePreview() {
  const routes = new Map([
    ["/", "/live-root.html"],
    ["/gallery-ai", "/live-root.html"],
    ["/gallery-ai/", "/live-root.html"],
    [
      "/gallery-ai/artist-application",
      "/live-artist-application.html",
    ],
    [
      "/gallery-ai/artist-application/",
      "/live-artist-application.html",
    ],
  ]);

  return {
    name: "production-route-preview",
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const pathname = request.url?.split("?")[0];
        if (pathname && routes.has(pathname)) {
          request.url = routes.get(pathname);
        }
        next();
      });
    },
  };
}

function injectElevenAgentCarousel() {
  return {
    name: "inject-eleven-agent-carousel",
    closeBundle() {
      for (const page of ["live-root.html", "live-gallery-ai.html"]) {
        const file = path.resolve("dist/client", page);
        let html = readFileSync(file, "utf8");
        if (html.includes("eleven-agent-carousel.js")) continue;
        html = html
          .replace('<script defer src="/assets/remove-source-link-n8n-cloud.js"></script>', "")
          .replace('<script type="module" src="/assets/move-workspace-card-n8n-cloud.js"></script>', "")
          .replace('<script defer src="/assets/remove-source-link.js"></script>', "")
          .replace('<script type="module" src="/assets/move-workspace-card.js?v=1"></script>', "");
        html = html.replace(
          "</head>",
          '<link rel="stylesheet" href="/assets/eleven-agent-carousel.css?v=1"><script defer src="/assets/eleven-agent-carousel.js?v=1"></script></head>',
        );
        writeFileSync(file, html);
      }
    },
  };
}

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [productionRoutePreview(), react(), injectElevenAgentCarousel()],
});
