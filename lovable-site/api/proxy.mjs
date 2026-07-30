const LOVABLE_ORIGIN = "https://gallery-ai.lovable.app";

export default async function handler(request, response) {
  const requestedPath =
    typeof request.query.path === "string" ? request.query.path : "";
  const target = new URL(`/${requestedPath}`, LOVABLE_ORIGIN);

  for (const [key, value] of Object.entries(request.query)) {
    if (key !== "path" && typeof value === "string") {
      target.searchParams.set(key, value);
    }
  }

  const upstream = await fetch(target, {
    headers: {
      accept: request.headers.accept || "*/*",
      "user-agent": request.headers["user-agent"] || "Gallery AI",
    },
  });

  response.status(upstream.status);
  upstream.headers.forEach((value, key) => {
    if (!["content-encoding", "content-length", "transfer-encoding"].includes(key)) {
      response.setHeader(key, value);
    }
  });

  const contentType = upstream.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    response.send(Buffer.from(await upstream.arrayBuffer()));
    return;
  }

  const html = await upstream.text();
  const badgeOverride =
    "<style>#lovable-badge{display:none!important}</style>";
  response.send(html.replace("</head>", `${badgeOverride}</head>`));
}
