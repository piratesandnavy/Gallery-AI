import crypto from "node:crypto";

const ALLOWED_ORIGIN = "https://www.lemuseedumonde.com";
const PAGE_URL = `${ALLOWED_ORIGIN}/gallery-ai/artist-application`;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestsByAddress = new Map();

const LIMITS = {
  name: 120,
  email: 254,
  location: 160,
  websiteOrInstagram: 300,
  medium: 100,
  style: 160,
  yearsActive: 80,
  representationHistory: 200,
  portfolioLinks: 1000,
  bio: 300,
  artistStatement: 500,
};

function clean(value, maxLength) {
  return String(value || "")
    .replaceAll("\u0000", "")
    .trim()
    .slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function requestAddress(request) {
  return String(
    request.headers["x-forwarded-for"] ||
      request.headers["x-real-ip"] ||
      request.socket?.remoteAddress ||
      "unknown",
  )
    .split(",")[0]
    .trim();
}

function isRateLimited(address, now) {
  const recent = (requestsByAddress.get(address) || []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );
  recent.push(now);
  requestsByAddress.set(address, recent);
  return recent.length > MAX_REQUESTS_PER_WINDOW;
}

function sanitizeFiles(files) {
  if (!Array.isArray(files)) return [];
  const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "application/pdf",
  ]);

  return files.slice(0, 10).flatMap((file) => {
    const name = clean(file?.name, 180);
    const type = clean(file?.type, 80).toLowerCase();
    const size = Number(file?.size);
    if (
      !name ||
      !allowedTypes.has(type) ||
      !Number.isFinite(size) ||
      size < 0 ||
      size > 20 * 1024 * 1024
    ) {
      return [];
    }
    return [{ name, type, size }];
  });
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  if (request.headers.origin && request.headers.origin !== ALLOWED_ORIGIN) {
    response.status(403).json({ error: "Invalid request origin." });
    return;
  }

  if (clean(request.body?.companyWebsite, 200)) {
    response.status(200).json({ ok: true });
    return;
  }

  if (isRateLimited(requestAddress(request), Date.now())) {
    response
      .status(429)
      .json({ error: "Too many submissions. Please wait and try again." });
    return;
  }

  const application = {
    submissionId:
      clean(request.body?.submissionId, 100) || crypto.randomUUID(),
    artistName: clean(request.body?.artistName, LIMITS.name),
    artistEmail: clean(request.body?.artistEmail, LIMITS.email).toLowerCase(),
    location: clean(request.body?.location, LIMITS.location),
    websiteOrInstagram: clean(
      request.body?.websiteOrInstagram,
      LIMITS.websiteOrInstagram,
    ),
    medium: clean(request.body?.medium, LIMITS.medium),
    style: clean(request.body?.style, LIMITS.style),
    artStyleGenre: clean(request.body?.artStyleGenre, LIMITS.style),
    yearsActive: clean(request.body?.yearsActive, LIMITS.yearsActive),
    representationHistory: clean(
      request.body?.representationHistory,
      LIMITS.representationHistory,
    ),
    portfolioLinks: clean(
      request.body?.portfolioLinks,
      LIMITS.portfolioLinks,
    ),
    bio: clean(request.body?.bio, LIMITS.bio),
    artistStatement: clean(
      request.body?.artistStatement,
      LIMITS.artistStatement,
    ),
    uploadedFiles: sanitizeFiles(request.body?.uploadedFiles),
    consent: request.body?.consent === true,
    submissionTimestamp: new Date().toISOString(),
    pageUrl: PAGE_URL,
  };

  if (
    !application.artistName ||
    !isEmail(application.artistEmail) ||
    !application.location ||
    !application.medium ||
    !application.artStyleGenre ||
    !application.bio ||
    !application.artistStatement ||
    !application.consent
  ) {
    response
      .status(400)
      .json({ error: "Please complete every required application field." });
    return;
  }

  if (
    !process.env.N8N_ARTIST_APPLICATION_WEBHOOK_URL ||
    !process.env.ARTIST_APPLICATION_WEBHOOK_SECRET
  ) {
    console.error("Artist application webhook is not configured.");
    response
      .status(503)
      .json({ error: "Applications are temporarily unavailable." });
    return;
  }

  try {
    const webhookResponse = await fetch(
      process.env.N8N_ARTIST_APPLICATION_WEBHOOK_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": process.env.ARTIST_APPLICATION_WEBHOOK_SECRET,
        },
        body: JSON.stringify(application),
        signal: AbortSignal.timeout(120000),
      },
    );
    const result = await webhookResponse.json().catch(() => ({}));

    if (!webhookResponse.ok || result.ok !== true) {
      console.error("Artist application automation failed.", {
        status: webhookResponse.status,
        submissionId: application.submissionId,
      });
      response.status(502).json({
        error:
          "Your application could not be delivered. Please retry in a moment.",
      });
      return;
    }

    response.status(200).json({
      ok: true,
      submissionId: application.submissionId,
    });
  } catch (error) {
    console.error("Artist application webhook request failed.", {
      name: error?.name,
      submissionId: application.submissionId,
    });
    response.status(502).json({
      error:
        "Your application could not be delivered. Please retry in a moment.",
    });
  }
}
