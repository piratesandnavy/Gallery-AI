const RECIPIENT = "viktormascot@gmail.com";
const MAX_LENGTHS = {
  name: 120,
  gallery: 160,
  email: 254,
  message: 5000,
};

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const origin = request.headers.origin;
  if (origin && origin !== "https://www.lemuseedumonde.com") {
    response.status(403).json({ error: "Invalid origin" });
    return;
  }

  const details = {
    name: clean(request.body?.name, MAX_LENGTHS.name),
    gallery: clean(request.body?.gallery, MAX_LENGTHS.gallery),
    email: clean(request.body?.email, MAX_LENGTHS.email),
    message: clean(request.body?.message, MAX_LENGTHS.message),
  };

  if (
    !details.name ||
    !details.gallery ||
    !details.message ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)
  ) {
    response.status(400).json({ error: "Please complete every field." });
    return;
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Gallery AI <notifications@${process.env.RESEND_EMAIL_DOMAIN}>`,
      to: [RECIPIENT],
      reply_to: details.email,
      subject: `New Gallery AI enquiry from ${details.name}`,
      html: `
        <h1>New Gallery AI enquiry</h1>
        <p><strong>Name:</strong> ${escapeHtml(details.name)}</p>
        <p><strong>Gallery:</strong> ${escapeHtml(details.gallery)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(details.email)}">${escapeHtml(details.email)}</a></p>
        <p><strong>What they would like to automate:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(details.message)}</p>
      `,
    }),
  });

  if (!resendResponse.ok) {
    const error = await resendResponse.text();
    console.error("Resend delivery failed:", resendResponse.status, error);
    response.status(502).json({ error: "The enquiry could not be sent." });
    return;
  }

  response.status(200).json({ ok: true });
}
