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
  const contactFormScript = `
    <script>
      document.addEventListener("submit", async function (event) {
        const form = event.target;
        if (!(form instanceof HTMLFormElement) || !form.querySelector('[name="message"]')) return;

        event.preventDefault();
        event.stopImmediatePropagation();

        const button = form.querySelector('button[type="submit"]');
        let status = form.querySelector('[data-contact-status]');
        if (!status) {
          status = document.createElement("p");
          status.dataset.contactStatus = "";
          status.setAttribute("role", "status");
          status.style.marginTop = "16px";
          status.style.fontFamily = "DM Sans, sans-serif";
          button.insertAdjacentElement("afterend", status);
        }

        button.disabled = true;
        button.textContent = "Sending…";
        status.textContent = "";

        const data = Object.fromEntries(new FormData(form).entries());
        try {
          const result = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });
          if (!result.ok) {
            const body = await result.json().catch(function () { return {}; });
            throw new Error(body.error || "The enquiry could not be sent.");
          }
          form.reset();
          status.style.color = "#e9bf79";
          status.textContent = "Thank you — your enquiry has been sent.";
        } catch (error) {
          status.style.color = "#ef8b82";
          status.textContent = error.message || "The enquiry could not be sent. Please try again.";
        } finally {
          button.disabled = false;
          button.textContent = "Send enquiry";
        }
      }, true);
    </script>
  `;
  response.send(
    html
      .replace("</head>", `${badgeOverride}</head>`)
      .replace("</body>", `${contactFormScript}</body>`),
  );
}
