const walkthroughVideo = "/assets/gallery/gallery-ai-walkthrough.mp4";
const walkthroughPoster = "/assets/gallery/gallery-ai-walkthrough-poster.jpg";

function installWalkthroughStyles() {
  if (document.getElementById("privacy-walkthrough-styles")) return;

  const style = document.createElement("style");
  style.id = "privacy-walkthrough-styles";
  style.textContent = `
    .privacy-copy-only.privacy-with-video,
    .privacy-with-video {
      display: grid;
      gap: 48px;
      align-items: center;
    }

    .privacy-copy-only.privacy-with-video > div,
    .privacy-with-video > div {
      max-width: none;
      min-width: 0;
    }

    .privacy-walkthrough {
      margin: 0;
      overflow: hidden;
      border: 1px solid rgba(200, 160, 98, 0.3);
      border-radius: 20px;
      background: #090806;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
    }

    .privacy-walkthrough video {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 16 / 9;
      background: #090806;
    }

    @media (min-width: 1024px) {
      .privacy-copy-only.privacy-with-video,
      .privacy-with-video {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
        gap: 56px;
      }
    }

    @media (max-width: 700px) {
      .privacy-walkthrough {
        border-radius: 14px;
      }
    }
  `;
  document.head.appendChild(style);
}

function placeWalkthroughVideo() {
  const designLabel = Array.from(
    document.querySelectorAll("main section span"),
  ).find(
    (label) => label.textContent.trim().toLowerCase() === "design principle",
  );
  const copyColumn = designLabel?.parentElement;
  const grid = copyColumn?.parentElement;
  if (!grid || grid.querySelector(".privacy-walkthrough")) return;

  installWalkthroughStyles();

  const figure = document.createElement("figure");
  figure.className = "privacy-walkthrough";

  const video = document.createElement("video");
  video.src = walkthroughVideo;
  video.poster = walkthroughPoster;
  video.controls = true;
  video.playsInline = true;
  video.preload = "none";
  video.setAttribute("aria-label", "Gallery AI walkthrough video");
  figure.appendChild(video);

  grid.classList.add("privacy-with-video");
  grid.appendChild(figure);
}

placeWalkthroughVideo();

const walkthroughObserver = new MutationObserver(placeWalkthroughVideo);
walkthroughObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

window.setTimeout(() => {
  placeWalkthroughVideo();
  walkthroughObserver.disconnect();
}, 10000);
