const workspaceHref =
  "https://nex3.app.n8n.cloud/home/workflows";

function moveWorkspaceCard() {
  const workspaceLink = document.querySelector(
    `main a[href="${workspaceHref}"]`,
  );
  const workspaceCard = workspaceLink?.parentElement;

  if (!workspaceCard) return;

  const workspaceCopy = workspaceCard.querySelector("p");
  if (workspaceCopy?.textContent.includes("All five agents live")) {
    workspaceCopy.textContent = workspaceCopy.textContent.replace(
      "All five agents live",
      "All seven agents live",
    );
  }

  if (!workspaceCard.textContent.includes("All seven agents live")) return;

  const designLabel = Array.from(
    document.querySelectorAll("main section span"),
  ).find(
    (label) => label.textContent.trim().toLowerCase() === "design principle",
  );
  const designContainer = designLabel?.parentElement;

  if (!designContainer || workspaceCard.parentElement === designContainer) return;

  designContainer.appendChild(workspaceCard);
}

function updateChatAgentCopy() {
  const oldCopy =
    "I can explain how the four agents work, what stays on your machine, and pass your details to the team.";
  const newCopy =
    "I can explain how the seven agents work, what stays on your machine, and pass your details to the team.";

  Array.from(document.querySelectorAll('[role="log"] p')).forEach((paragraph) => {
    if (paragraph.textContent.trim() === oldCopy) paragraph.textContent = newCopy;
  });
}

function applyAgentUpdates() {
  moveWorkspaceCard();
  updateChatAgentCopy();
}

applyAgentUpdates();

const workspaceCardObserver = new MutationObserver(applyAgentUpdates);
workspaceCardObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

window.setTimeout(() => {
  applyAgentUpdates();
  workspaceCardObserver.disconnect();
}, 10000);
