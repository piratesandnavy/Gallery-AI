(function () {
const agents = [
  ["01", "Artist Intake Agent", "New artists, onboarded fast", "Captures artist details, writes a concise AI summary, updates your database, and drafts the first outreach so no new artist relationship stalls at intake.", "/assets/gallery/weekly-report.avif", "https://nex3.app.n8n.cloud/workflow/Yt2ObGKymMyzBpeI"],
  ["02", "Opportunity Matcher", "The right call for the right artist", "Reviews exhibitions, grants, and open calls against each artist's profile, then logs the strongest matches so your team can follow up with confidence.", "/assets/gallery/opportunity-finder.avif", "https://nex3.app.n8n.cloud/workflow/9Qpl24T0gifGgBmx"],
  ["03", "Collector Recommendation Agent", "Personal picks, prepared in minutes", "Pairs collector preferences with available inventory to suggest artworks worth sharing, so every conversation starts with a relevant, well-chosen recommendation.", "/assets/gallery/collector-assistant.avif", "https://nex3.app.n8n.cloud/workflow/WgDdDuX3TJnorkyr"],
  ["04", "Weekly Gallery Report", "Your week, summarized and ready to send", "Pulls data from Sheets and Calendar, writes an operational summary, and saves it as a Gmail draft you review before it goes out.", "/assets/gallery/weekly-report.avif", "https://nex3.app.n8n.cloud/workflow/koVENSQsPVooglzR"],
  ["05", "Artist Relations Agent", "Every artist relationship, on track", "Tracks conversations, follow-ups, and milestones for each artist, keeping a full relationship history so nothing important falls through the cracks.", "/assets/gallery/roundcarousel-e60dd7f7.png", "https://nex3.app.n8n.cloud/workflow/sQ80p48AY4LWG5qb"],
  ["06", "Opportunity Scout", "New openings, found before the deadline", "Scans for new gallery opportunities and organizes promising leads into a review list, giving your team more time to prepare strong applications.", "/assets/gallery/roundcarousel-eec164e9.png", "https://nex3.app.n8n.cloud/workflow/MbZsQNgCMQxIcHs1"],
  ["07", "Finance & Sales Admin Agent", "Less admin, cleaner books", "Handles routine sales administration, finance follow-ups, and operational reminders so your team spends less time on paperwork and more on clients.", "/assets/gallery/roundcarousel-ed7b1c40.png", "https://nex3.app.n8n.cloud/workflow/cH1Xmg4hyQB2CeFK"],
  ["08", "Chief of Staff Orchestrator", "One request, routed to the right agent", "Coordinates the full agent team, sending each task to the right workflow so gallery operations run as one connected system.", "/assets/gallery/artist-onboarding.avif", "https://nex3.app.n8n.cloud/workflow/Cxl4i0nP8pTI5ztx"],
  ["09", "Collector CRM Agent", "Know every collector, every time", "Maintains each collector's preferences, conversation history, and buying signals in one place, so your team always knows who to contact and why.", "/assets/gallery/roundcarousel-e60dd7f7.png", "https://nex3.app.n8n.cloud/workflow/f5HaInPvbCqiTRjX"],
  ["10", "Registrar Agent", "Inventory records you can trust", "Organizes artwork records, movement details, and documentation, keeping inventory accurate and audit-ready as works are loaned, shipped, or sold.", "/assets/gallery/roundcarousel-eec164e9.png", "https://nex3.app.n8n.cloud/workflow/3mOlGImOOQ8E7xP1"],
  ["11", "Content & Marketing Agent", "Campaigns drafted, ready for your voice", "Prepares exhibition content, campaign ideas, and marketing drafts for your review, helping you promote shows consistently without starting from a blank page.", "/assets/gallery/roundcarousel-ed7b1c40.png", "https://nex3.app.n8n.cloud/workflow/Y8ttUTKH9LYlF1Jn"],
];

function mountCarousel() {
  if (document.querySelector("[data-eleven-agent-carousel]")) return true;
  const original = document.querySelector("#workflows");
  if (!original) return false;

  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/assets/eleven-agent-carousel.css";
  document.head.append(stylesheet);

  const section = document.createElement("section");
  section.className = "eca-section";
  section.dataset.elevenAgentCarousel = "";
  section.innerHTML = `
    <div class="eca-heading">
      <p>Eleven connected agents</p>
      <h2>Built around real gallery work.</h2>
      <span>Click a card, drag sideways, use the arrows, or wait for the carousel to move through the connected gallery workflows.</span>
    </div>
    <div class="eca-stage" role="group" aria-label="Eleven connected gallery agents" tabindex="0">
      <button class="eca-arrow eca-prev" type="button" aria-label="Previous agent">←</button>
      <div class="eca-ring"></div>
      <button class="eca-arrow eca-next" type="button" aria-label="Next agent">→</button>
    </div>
    <div class="eca-dots" aria-label="Choose an agent"></div>`;
  original.insertAdjacentElement("afterend", section);

  const ring = section.querySelector(".eca-ring");
  const dots = section.querySelector(".eca-dots");
  let active = 0;
  let paused = false;
  let dragStart = null;

  const cards = agents.map((agent, index) => {
    const card = document.createElement("article");
    card.className = "eca-card";
    card.innerHTML = `<img src="${agent[4]}" alt="${agent[1]}"><i></i><div><b>${agent[0]}</b><h3>${agent[1]}</h3><em>${agent[2]}</em><small>${agent[3]}</small><a href="${agent[5]}" target="_blank" rel="noreferrer">Open agent ↗</a></div>`;
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      active = index;
      render();
    });
    ring.append(card);
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show ${agent[1]}`);
    dot.addEventListener("click", () => { active = index; render(); });
    dots.append(dot);
    return card;
  });

  function offsetFor(index) {
    let offset = index - active;
    if (offset > agents.length / 2) offset -= agents.length;
    if (offset < -agents.length / 2) offset += agents.length;
    return offset;
  }

  function render() {
    cards.forEach((card, index) => {
      const offset = offsetFor(index);
      const distance = Math.abs(offset);
      card.style.setProperty("--offset", offset);
      card.style.setProperty("--distance", distance);
      card.style.setProperty("--opacity", distance > 2 ? 0 : index === active ? 1 : .58);
      card.style.setProperty("--z", 20 - distance);
      card.toggleAttribute("aria-current", index === active);
      card.setAttribute("aria-hidden", distance > 2 ? "true" : "false");
    });
    [...dots.children].forEach((dot, index) => dot.classList.toggle("active", index === active));
  }

  const move = (direction) => { active = (active + direction + agents.length) % agents.length; render(); };
  section.querySelector(".eca-prev").addEventListener("click", () => move(-1));
  section.querySelector(".eca-next").addEventListener("click", () => move(1));
  section.querySelector(".eca-stage").addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });
  section.addEventListener("pointerenter", () => { paused = true; });
  section.addEventListener("pointerleave", () => { paused = false; });
  section.addEventListener("pointerdown", (event) => { dragStart = event.clientX; paused = true; });
  section.addEventListener("pointerup", (event) => {
    if (dragStart !== null && Math.abs(event.clientX - dragStart) > 35) move(event.clientX < dragStart ? 1 : -1);
    dragStart = null;
    paused = false;
  });
  window.setInterval(() => { if (!paused && document.visibilityState === "visible") move(1); }, 4600);
  render();
  return true;
}

function mountAfterHydration() {
  window.setTimeout(mountCarousel, 900);
  window.setTimeout(mountCarousel, 1800);
}

if (document.readyState === "complete") mountAfterHydration();
else window.addEventListener("load", mountAfterHydration, { once: true });
})();
