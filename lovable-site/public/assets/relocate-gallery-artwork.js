const artworkPath = "/assets/gallery/more-time-for-art-less-admin.png";
const artworkAlt =
  "A gallery director walking through a warmly lit exhibition space connected by Gallery AI workflows";

function findExactParagraph(copy) {
  return Array.from(document.querySelectorAll("p")).find(
    (paragraph) => paragraph.textContent.trim() === copy,
  );
}

function installArtworkStyles() {
  if (document.getElementById("gallery-artwork-placement-styles")) return;

  const style = document.createElement("style");
  style.id = "gallery-artwork-placement-styles";
  style.textContent = `
    .gallery-artwork-feature {
      width: min(100%, 1100px);
      margin: 56px auto 0;
      overflow: hidden;
      border: 1px solid rgba(200, 160, 98, 0.3);
      border-radius: 20px;
      background: #090806;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
    }

    .gallery-artwork-feature img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 1672 / 941;
      object-fit: cover;
    }

    .privacy-copy-only {
      display: block;
      width: 100%;
      max-width: 1152px;
    }

    .privacy-copy-only > div {
      max-width: 900px;
    }

    @media (max-width: 700px) {
      .gallery-artwork-feature {
        margin-top: 38px;
        border-radius: 14px;
      }
    }
  `;
  document.head.appendChild(style);
}

function placeArtwork() {
  installArtworkStyles();

  const featureCopy = findExactParagraph("Connected. Automated. Intelligent.");
  const featureCard = featureCopy?.parentElement?.parentElement;
  if (featureCard && !featureCard.classList.contains("gallery-artwork-feature")) {
    const figure = document.createElement("figure");
    figure.className = "gallery-artwork-feature";

    const image = document.createElement("img");
    image.src = artworkPath;
    image.alt = artworkAlt;
    image.loading = "lazy";
    figure.appendChild(image);

    featureCard.replaceWith(figure);
  }

  const privacyFigure = document.querySelector("figure.privacy-media-visual");
  const privacyContainer = privacyFigure?.parentElement;
  if (privacyFigure && privacyContainer) {
    privacyFigure.remove();
    privacyContainer.classList.remove("privacy-media-grid");
    privacyContainer.classList.add("privacy-copy-only");
  }
}

placeArtwork();

const artworkObserver = new MutationObserver(placeArtwork);
artworkObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

window.setTimeout(() => {
  placeArtwork();
  artworkObserver.disconnect();
}, 10000);
