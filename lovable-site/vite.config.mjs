import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function productionRoutePreview() {
  const routes = new Map([
    ["/", "/live-root.html"],
    ["/gallery-ai", "/live-gallery-ai.html"],
    ["/gallery-ai/", "/live-gallery-ai.html"],
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
  plugins: [productionRoutePreview(), react()],
});
