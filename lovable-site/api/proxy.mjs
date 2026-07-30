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
  const workflowCopyScript = `
    <script>
      (function () {
        const updates = [
          {
            number: "01",
            title: "Spreadsheet / Database",
            subtitle: "Where your records live",
            description: "Artists, artworks and collectors, kept in one place you already use."
          },
          {
            number: "02",
            title: "Calendar",
            subtitle: "What's ahead",
            description: "Shows, visits and deadlines, read straight off the calendar you already keep."
          },
          {
            number: "03",
            title: "Automation",
            subtitle: "The connector",
            description: "Watches for changes and passes details along."
          },
          {
            number: "04",
            title: "AI Model",
            subtitle: "The writer",
            description: "Turns the details into a summary or draft, running privately if you like."
          },
          {
            number: "05",
            title: "Draft / Action Item",
            subtitle: "Your final say",
            description: "Ready for you to review, edit, and send yourself."
          }
        ];
        const oldTitles = [
          "Google Sheets",
          "Google Calendar",
          "n8n",
          "Local Qwen AI",
          "Gmail draft"
        ];
        const oldHeroDescription =
          "An n8n automation system that connects gallery data, calendars, Gmail, and a locally running Qwen model to support artist onboarding, opportunity discovery, collector assistance, and weekly reporting.";
        const newHeroDescription =
          "An AI automation system that connects gallery data, calendars, email, and a range of private or commercial AI models to support artist onboarding, opportunity discovery, collector assistance, and weekly reporting.";

        function applyWorkflowCopy() {
          Array.from(document.querySelectorAll("p")).forEach(function (paragraph) {
            if (paragraph.textContent.trim() === oldHeroDescription) {
              paragraph.textContent = newHeroDescription;
            }
          });

          const heading = Array.from(document.querySelectorAll("h2")).find(
            function (element) {
              return element.textContent.trim() === "One clear automation path.";
            }
          );
          const section = heading && heading.closest("section");
          if (!section) return;

          const cards = Array.from(section.querySelectorAll("li")).slice(0, updates.length);
          updates.forEach(function (update, index) {
            const card = cards[index];
            if (!card) return;
            const number = card.querySelector("span");
            const title = card.querySelector("h3");
            const paragraphs = card.querySelectorAll("p");
            if (number && number.textContent !== update.number) number.textContent = update.number;
            if (title && title.textContent !== update.title) title.textContent = update.title;
            if (paragraphs[0] && paragraphs[0].textContent !== update.subtitle) {
              paragraphs[0].textContent = update.subtitle;
            }
            if (paragraphs[1] && paragraphs[1].textContent !== update.description) {
              paragraphs[1].textContent = update.description;
            }
          });

          Array.from(section.querySelectorAll("*")).forEach(function (element) {
            if (element.children.length) return;
            const oldIndex = oldTitles.indexOf(element.textContent.trim());
            if (oldIndex >= 0) element.textContent = updates[oldIndex].title;
          });
        }

        applyWorkflowCopy();
        document.addEventListener("DOMContentLoaded", applyWorkflowCopy);
        const observer = new MutationObserver(applyWorkflowCopy);
        observer.observe(document.documentElement, { childList: true, subtree: true });
        window.setTimeout(function () {
          applyWorkflowCopy();
          observer.disconnect();
        }, 10000);
      })();
    </script>
  `;
  response.send(
    html
      .replace("</head>", `${badgeOverride}</head>`)
      .replace(
        "</body>",
        `${contactFormScript}${workflowCopyScript}</body>`,
      ),
  );
}
