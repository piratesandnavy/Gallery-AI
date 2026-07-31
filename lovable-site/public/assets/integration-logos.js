const integrationLogos = {
  "Artist Database": [["Google Sheets", "/integrations/google-sheets.svg"], ["Airtable", "/integrations/airtable.svg"], ["Notion", "/integrations/notion.svg"]],
  "Smart Calendar": [["Google Calendar", "/integrations/google-calendar.svg"], ["Calendly", "/integrations/calendly.svg"], ["Microsoft Outlook", "/integrations/microsoft-outlook.svg"]],
  "Automation Engine": [["n8n", "/integrations/n8n.svg"], ["Zapier", "/integrations/zapier.svg"], ["Make", "/integrations/make.svg"]],
  "AI Assistant": [["OpenAI ChatGPT", "/integrations/openai.svg"], ["Anthropic Claude", "/integrations/anthropic.svg"], ["Google Gemini", "/integrations/google-gemini.svg"]],
  "Review & Send": [["Gmail", "/integrations/gmail.svg"], ["Microsoft Outlook", "/integrations/microsoft-outlook.svg"], ["Google Workspace", "/integrations/google-workspace.svg"]],
};

function buildLogoRow(title, logos) {
  const row = document.createElement("div");
  row.className = "gallery-integration-logos";
  row.setAttribute("role", "group");
  row.setAttribute("aria-label", `${title} integrations`);

  logos.forEach(([name, src]) => {
    const logo = document.createElement("span");
    logo.className = `gallery-integration-logo${name === "Google Workspace" ? " gallery-integration-logo--wide" : ""}`;
    logo.title = name;

    const image = document.createElement("img");
    image.src = src;
    image.alt = `${name} logo`;
    image.setAttribute("aria-label", name);
    image.loading = "lazy";

    logo.append(image);
    row.append(logo);
  });

  return row;
}

function installIntegrationLogos() {
  const headings = Array.from(document.querySelectorAll("h3"));

  Object.entries(integrationLogos).forEach(([title, logos]) => {
    const heading = headings.find((element) => element.textContent.trim() === title);
    if (!heading) return;

    const card = heading.closest("li");
    const featureList = card?.querySelector("ul");
    if (!card || !featureList || card.querySelector(".gallery-integration-logos")) return;

    featureList.before(buildLogoRow(title, logos));
  });
}

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = "/assets/integration-logos.css";
document.head.append(stylesheet);

window.setTimeout(() => {
  installIntegrationLogos();
  const integrationLogoTimer = window.setInterval(installIntegrationLogos, 120);
  window.setTimeout(() => window.clearInterval(integrationLogoTimer), 4000);
}, 800);
