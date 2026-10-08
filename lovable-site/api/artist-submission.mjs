// Emails for the /artist-submission form.
//
// The page still posts its answers to the Google Form (the record of truth).
// This endpoint adds the two emails Google Forms does not send on its own:
//   1. the full submission to the gallery inbox, and
//   2. a confirmation to the address the artist typed in.
//
// Requires the same environment variables as /api/contact:
//   RESEND_API_KEY, RESEND_EMAIL_DOMAIN (a domain verified in Resend).

const GALLERY_RECIPIENT = "viktormascot@gmail.com";
const GALLERY_NAME = "Le Musée du Monde";
const ALLOWED_ORIGIN = "https://www.lemuseedumonde.com";
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestsByAddress = new Map();

const LIMITS = {
  name: 120,
  email: 254,
  location: 160,
  option: 80,
  portfolio: 500,
  about: 3000,
  cv: 3000,
  notes: 3000,
};

function clean(value, maxLength) {
  return String(value || "")
    .replaceAll("\u0000", "")
    .trim()
    .slice(0, maxLength);
}

function cleanList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 15)
    .map((item) => clean(item, LIMITS.option))
    .filter(Boolean);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
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

// The confirmation goes to an address we have not verified, so it must not
// carry anything a stranger could use to send their own message through us.
// Only a plain-looking name is echoed back; everything else is fixed copy.
function greetingName(name) {
  const single = name.replace(/[\r\n]+/g, " ");
  if (single.length > 60 || /https?:|www\.|[<>@/\\]|\.[a-z]{2,}\b/i.test(single)) {
    return "";
  }
  return single;
}

async function sendEmail(message) {
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${GALLERY_NAME} <notifications@${process.env.RESEND_EMAIL_DOMAIN}>`,
      ...message,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!resendResponse.ok) {
    const error = await resendResponse.text();
    throw new Error(`Resend ${resendResponse.status}: ${error.slice(0, 300)}`);
  }
}

function row(label, value) {
  return `<p><strong>${label}:</strong><br><span style="white-space:pre-wrap">${
    escapeHtml(value) || "&mdash;"
  }</span></p>`;
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

  // Honeypot: real visitors never fill this in.
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

  const submission = {
    name: clean(request.body?.name, LIMITS.name),
    email: clean(request.body?.email, LIMITS.email).toLowerCase(),
    location: clean(request.body?.location, LIMITS.location),
    mediums: cleanList(request.body?.mediums),
    styles: cleanList(request.body?.styles),
    portfolio: clean(request.body?.portfolio, LIMITS.portfolio),
    about: clean(request.body?.about, LIMITS.about),
    cv: clean(request.body?.cv, LIMITS.cv),
    notes: clean(request.body?.notes, LIMITS.notes),
  };

  if (
    !submission.name ||
    !isEmail(submission.email) ||
    !submission.mediums.length ||
    !submission.styles.length ||
    !submission.portfolio ||
    !submission.about
  ) {
    response
      .status(400)
      .json({ error: "Please complete every required field." });
    return;
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_EMAIL_DOMAIN) {
    console.error("Artist submission email is not configured.");
    response.status(503).json({ error: "Email is temporarily unavailable." });
    return;
  }

  const hello = greetingName(submission.name);

  const results = await Promise.allSettled([
    sendEmail({
      to: [GALLERY_RECIPIENT],
      reply_to: submission.email,
      subject: `New artist submission: ${submission.name.replace(/[\r\n]+/g, " ")}`,
      html: `
        <h1>New artist submission</h1>
        ${row("Artist name", submission.name)}
        <p><strong>Email:</strong><br><a href="mailto:${escapeHtml(submission.email)}">${escapeHtml(submission.email)}</a></p>
        ${row("Location", submission.location)}
        ${row("Primary medium", submission.mediums.join(", "))}
        ${row("Artistic style", submission.styles.join(", "))}
        ${row("Portfolio link", submission.portfolio)}
        ${row("About the artist and their work", submission.about)}
        ${row("CV or exhibition highlights", submission.cv)}
        ${row("Anything else", submission.notes)}
        <p style="color:#777">Sent from ${ALLOWED_ORIGIN}/artist-submission. Reply to this email to write to the artist.</p>
      `,
    }),
    sendEmail({
      to: [submission.email],
      reply_to: GALLERY_RECIPIENT,
      subject: `We received your submission | ${GALLERY_NAME}`,
      html: `
        <p>Dear ${hello ? escapeHtml(hello) : "Artist"},</p>
        <p>Thank you for sharing your work with ${GALLERY_NAME}. This email confirms that we have received your submission.</p>
        <p>Our curatorial team reviews every submission and will be in touch by email if your practice is a fit for an upcoming exhibition.</p>
        <p>Warm regards,<br>${GALLERY_NAME}</p>
        <p style="color:#777;font-size:12px">You are receiving this because this address was entered on the artist submission form at ${ALLOWED_ORIGIN}. If that was not you, you can ignore this message.</p>
      `,
    }),
  ]);

  const [gallery, confirmation] = results;
  for (const [label, result] of [
    ["gallery", gallery],
    ["confirmation", confirmation],
  ]) {
    if (result.status === "rejected") {
      console.error(`Artist submission ${label} email failed:`, result.reason?.message);
    }
  }

  if (gallery.status === "rejected" && confirmation.status === "rejected") {
    response.status(502).json({ error: "The emails could not be sent." });
    return;
  }

  response.status(200).json({
    ok: true,
    galleryNotified: gallery.status === "fulfilled",
    confirmationSent: confirmation.status === "fulfilled",
  });
}
