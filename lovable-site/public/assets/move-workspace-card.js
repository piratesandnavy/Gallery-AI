const workspaceHref =
  "https://gallery-ai-production-d094.up.railway.app/home/workflows";

function moveWorkspaceCard() {
  const workspaceLink = document.querySelector(
    `main a[href="${workspaceHref}"]`,
  );
  const workspaceCard = workspaceLink?.parentElement;

  if (!workspaceCard?.textContent.includes("All four agents live")) return;

  const designLabel = Array.from(
    document.querySelectorAll("main section span"),
  ).find(
    (label) => label.textContent.trim().toLowerCase() === "design principle",
  );
  const designContainer = designLabel?.parentElement;

  if (!designContainer || workspaceCard.parentElement === designContainer) return;

  designContainer.appendChild(workspaceCard);
}

moveWorkspaceCard();

const workspaceCardObserver = new MutationObserver(moveWorkspaceCard);
workspaceCardObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

window.setTimeout(() => {
  moveWorkspaceCard();
  workspaceCardObserver.disconnect();
}, 10000);
