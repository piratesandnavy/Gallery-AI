const ALLOWED_ORIGIN = "https://www.lemuseedumonde.com";
const MAX_PROMPT_LENGTH = 2000;

function clean(value, maxLength = MAX_PROMPT_LENGTH) {
  return String(value || "")
    .replaceAll("\u0000", "")
    .trim()
    .slice(0, maxLength);
}

function messageText(message) {
  if (!message || typeof message !== "object") return "";
  if (typeof message.content === "string") return clean(message.content);
  if (!Array.isArray(message.parts)) return "";
  return clean(
    message.parts
      .filter((part) => part?.type === "text")
      .map((part) => part.text)
      .join(" "),
  );
}

function replyFor(prompt) {
  const lower = prompt.toLowerCase();

  if (/data|privacy|private|secure|credential|ollama|local/.test(lower)) {
    return "Your gallery data stays under your control. Gallery AI can run models locally through Ollama or use secure dedicated cloud services. Workflows use environment-based configuration, keep credentials out of the repository, and prepare drafts for human review before anything client-facing is sent.";
  }

  if (/agent|workflow|what.*do|how.*work|automation/.test(lower)) {
    return "Gallery AI connects seven operational roles: Artist Relations, Opportunity Scout, Finance & Sales Admin, Chief of Staff, Collector CRM, Inventory, and Content & Marketing. They coordinate gallery data, calendars, email, and AI-assisted drafts while keeping a person in control of final decisions and communication.";
  }

  if (/price|pricing|cost|quote|demo|start|contact|interested|setup/.test(lower)) {
    return "Every gallery setup is tailored to its tools and workflows. Use the Contact us form on this page to share what you would like to automate, and the Gallery AI team will follow up with the recommended setup and pricing.";
  }

  if (/artist|application|apply|portfolio|representation/.test(lower)) {
    return "Artists can use the Artist Application link in the site navigation to share their practice, portfolio, location, and contact details. Applications are reviewed by a person; Gallery AI helps organize the information but does not make representation decisions on its own.";
  }

  if (/collector|crm|sales/.test(lower)) {
    return "The Collector CRM Assistant keeps preferences, conversation history, and buying signals organized so the gallery team can prepare more thoughtful follow-ups. Any outgoing communication remains subject to human review.";
  }

  if (/inventory|artwork|loan|shipping|shipment/.test(lower)) {
    return "The Inventory Agent organizes artwork records, movement details, loans, shipping information, and documentation so the gallery has a clearer, audit-ready view of each work.";
  }

  return "I can help with Gallery AI’s seven agents, privacy and local AI, artist applications, collector CRM, inventory, workflow setup, or how to get started. Tell me which area you are interested in and I’ll point you in the right direction.";
}

function streamPart(response, value) {
  response.write(`data: ${JSON.stringify(value)}\n\n`);
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

  const messages = Array.isArray(request.body?.messages)
    ? request.body.messages
    : [];
  const prompt = messageText(
    [...messages].reverse().find((message) => message?.role === "user"),
  );

  if (!prompt) {
    response.status(400).json({ error: "Please enter a question." });
    return;
  }

  const id = crypto.randomUUID();
  const text = replyFor(prompt);

  response.statusCode = 200;
  response.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("X-Vercel-AI-UI-Message-Stream", "v1");

  streamPart(response, { type: "start", messageId: id });
  streamPart(response, { type: "start-step" });
  streamPart(response, { type: "text-start", id: "answer" });
  streamPart(response, { type: "text-delta", id: "answer", delta: text });
  streamPart(response, { type: "text-end", id: "answer" });
  streamPart(response, { type: "finish-step" });
  streamPart(response, { type: "finish" });
  response.end("data: [DONE]\n\n");
}
