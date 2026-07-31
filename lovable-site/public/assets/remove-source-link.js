const sourceHref = "https://github.com/piratesandnavy/Gallery-AI";

function removeSourceLink() {
  document
    .querySelectorAll(`header a[href="${sourceHref}"]`)
    .forEach((link) => link.remove());
}

removeSourceLink();

new MutationObserver(removeSourceLink).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
