import fs from "node:fs";
import path from "node:path";

const [inputPath, outputPath = "/tmp/gallery-ai-repaired-workflows.json"] =
  process.argv.slice(2);

if (!inputPath) {
  throw new Error(
    "Usage: node scripts/repair-live-fallbacks.mjs <live-export.json> [output.json]",
  );
}

const workflows = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const activeIds = {
  onboarding: "mjoQ3fQc1eE3ALqx",
  opportunities: "tdb1ZbGSeIGyExKX",
  collector: "SXASSCLEd5HVQEF7",
};

function workflow(id) {
  const found = workflows.find((item) => item.id === id);
  if (!found) throw new Error(`Active workflow ${id} was not found`);
  return structuredClone(found);
}

function node(workflowValue, name) {
  const found = workflowValue.nodes.find((item) => item.name === name);
  if (!found) throw new Error(`${workflowValue.name}: missing node ${name}`);
  return found;
}

function configuration(workflowValue) {
  const config = node(workflowValue, "Configuration");
  const assignments = config.parameters.assignments.assignments;
  const owner = assignments.find((item) => item.name === "ownerEmail");
  if (!owner) throw new Error(`${workflowValue.name}: missing ownerEmail`);
  owner.value = "={{ $env.VIKTOR_NOTIFICATION_EMAIL }}";

  config.parameters.assignments.assignments = assignments.filter(
    (item) => item.name !== "ollamaUrl",
  );
}

function addLogNode(workflowValue, previousNodeName, position) {
  workflowValue.nodes = workflowValue.nodes.filter(
    (item) => item.name !== "Record Delivery Result",
  );
  workflowValue.nodes.push({
    parameters: {
      jsCode: `const source = $input.first().json;
const context = {
  event: "AGENT_COMPLETED",
  agent: ${JSON.stringify(workflowValue.name)},
  timestamp: new Date().toISOString(),
  providerMessageId: source.id || source.messageId || source.threadId || "",
};
console.log(JSON.stringify(context));
return [{ json: context }];`,
    },
    id: `${workflowValue.id}-delivery-log`,
    name: "Record Delivery Result",
    type: "n8n-nodes-base.code",
    typeVersion: 2,
    position,
  });
  workflowValue.connections[previousNodeName] = {
    main: [[{ node: "Record Delivery Result", type: "main", index: 0 }]],
  };
}

const onboarding = workflow(activeIds.onboarding);
configuration(onboarding);

node(onboarding, "Artist Application Form").parameters.formFields.values = [
  { fieldLabel: "Name", requiredField: true },
  { fieldLabel: "Email", fieldType: "email", requiredField: true },
  { fieldLabel: "Location", requiredField: true },
  { fieldLabel: "Website / Instagram" },
  { fieldLabel: "Medium", requiredField: true },
  { fieldLabel: "Style" },
  { fieldLabel: "Art Style / Genre" },
  { fieldLabel: "Years Active" },
  { fieldLabel: "Representation History" },
  { fieldLabel: "Portfolio", fieldType: "url" },
  { fieldLabel: "Bio", fieldType: "textarea", requiredField: true },
  {
    fieldLabel: "Artist Statement",
    fieldType: "textarea",
    requiredField: true,
  },
  { fieldLabel: "Consent Accepted", requiredField: true },
];

node(onboarding, "Normalize Application").parameters.assignments.assignments = [
  ["name", "={{ $('Artist Application Form').item.json.Name || '' }}"],
  ["email", "={{ $('Artist Application Form').item.json.Email || '' }}"],
  ["location", "={{ $('Artist Application Form').item.json.Location || '' }}"],
  [
    "website",
    "={{ $('Artist Application Form').item.json['Website / Instagram'] || '' }}",
  ],
  [
    "medium",
    "={{ $('Artist Application Form').item.json.Medium || '' }}",
  ],
  [
    "style",
    "={{ $('Artist Application Form').item.json['Art Style / Genre'] || $('Artist Application Form').item.json.Style || '' }}",
  ],
  [
    "yearsActive",
    "={{ $('Artist Application Form').item.json['Years Active'] || '' }}",
  ],
  [
    "representationHistory",
    "={{ $('Artist Application Form').item.json['Representation History'] || '' }}",
  ],
  [
    "portfolio",
    "={{ $('Artist Application Form').item.json.Portfolio || '' }}",
  ],
  ["bio", "={{ $('Artist Application Form').item.json.Bio || '' }}"],
  [
    "statement",
    "={{ $('Artist Application Form').item.json['Artist Statement'] || '' }}",
  ],
  [
    "consent",
    "={{ $('Artist Application Form').item.json['Consent Accepted'] || 'Accepted via website form' }}",
  ],
].map(([name, value], index) => ({
  id: `application-${index + 1}`,
  name,
  value,
  type: "string",
}));

node(onboarding, "Summarize Artist").parameters.jsCode = `const application = $("Normalize Application").item.json;
console.log(JSON.stringify({ event: "FORM_RECEIVED", agent: "Artist Onboarding", timestamp: new Date().toISOString() }));
const required = ["name", "email", "location", "medium", "bio", "statement"];
const missing = required.filter((key) => !String(application[key] || "").trim());
if (missing.length) {
  console.log(JSON.stringify({ event: "AGENT_FAILED", agent: "Artist Onboarding", failedStep: "VALIDATION", missing, timestamp: new Date().toISOString() }));
  throw new Error("Missing required application fields: " + missing.join(", "));
}
if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(application.email)) {
  throw new Error("A valid applicant email address is required");
}
const canonical = JSON.stringify({
  email: application.email.trim().toLowerCase(),
  portfolio: application.portfolio,
  statement: application.statement,
});
let hash = 2166136261;
for (let index = 0; index < canonical.length; index += 1) {
  hash ^= canonical.charCodeAt(index);
  hash = Math.imul(hash, 16777619);
}
const applicationId = "GA-" + new Date().toISOString().slice(0, 10).replaceAll("-", "") + "-" + (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
const state = $getWorkflowStaticData("global");
if (state[applicationId]) {
  console.log(JSON.stringify({ event: "AGENT_COMPLETED", agent: "Artist Onboarding", applicationId, duplicate: true, timestamp: new Date().toISOString() }));
  return [];
}
state[applicationId] = { receivedAt: new Date().toISOString() };
console.log(JSON.stringify({ event: "VALIDATION_PASSED", agent: "Artist Onboarding", applicationId, timestamp: new Date().toISOString() }));
const details = [
  application.medium && "Primary medium: " + application.medium,
  application.style && "Style: " + application.style,
  application.location && "Location: " + application.location,
].filter(Boolean).join(". ");
return [{ json: {
  applicationId,
  submittedAt: new Date().toISOString(),
  summary: application.name + " submitted application " + applicationId + ". " + details + ". Review the portfolio, biography, and artist statement before responding.",
} }];`;

node(onboarding, "Parse Summary").parameters.jsCode =
  'console.log(JSON.stringify({ event: "APPLICATION_SAVED_PENDING", agent: "Artist Onboarding", applicationId: $json.applicationId, timestamp: new Date().toISOString() })); return [{ json: $json }];';

const saveArtist = node(onboarding, "Save Artist");
saveArtist.parameters.columns.value = {
  Name: "={{ $('Normalize Application').item.json.name }}",
  Email: "={{ $('Normalize Application').item.json.email }}",
  Style:
    "={{ [$('Normalize Application').item.json.medium, $('Normalize Application').item.json.style].filter(Boolean).join(' / ') }}",
  Location: "={{ $('Normalize Application').item.json.location }}",
  Portfolio:
    "={{ [$('Normalize Application').item.json.website, $('Normalize Application').item.json.portfolio].filter(Boolean).join(' | ') }}",
  AI_Summary:
    "={{ $('Parse Summary').item.json.summary + '\\n\\nBio: ' + $('Normalize Application').item.json.bio + '\\n\\nArtist Statement: ' + $('Normalize Application').item.json.statement + '\\n\\nYears Active: ' + $('Normalize Application').item.json.yearsActive + '\\nRepresentation History: ' + $('Normalize Application').item.json.representationHistory + '\\nConsent: ' + $('Normalize Application').item.json.consent }}",
  Date_Added: "={{ $('Parse Summary').item.json.submittedAt }}",
};
saveArtist.parameters.columns.matchingColumns = ["Email"];

node(onboarding, "Write Welcome Draft").parameters.jsCode = `const application = $("Normalize Application").item.json;
const saved = $("Parse Summary").item.json;
const firstName = String(application.name).trim().split(/\\s+/)[0];
return [{ json: {
  subject: "We received your artist application",
  body: "Hello " + firstName + ",\\n\\nWe received your artist application.\\n\\nApplication ID: " + saved.applicationId + "\\n\\nOur team expects to review your submission within 5–7 business days. We will contact you if more information is required. This confirmation does not mean that the application has been accepted.\\n\\nGallery contact: viktormascot@gmail.com\\n\\nBest,\\nGallery Team",
} }];`;

node(onboarding, "Parse Welcome Draft").parameters.jsCode =
  'return [{ json: $json }];';

const applicantEmail = node(onboarding, "Create Welcome Draft");
delete applicantEmail.parameters.resource;
applicantEmail.parameters.sendTo =
  "={{ $('Normalize Application').item.json.email }}";
applicantEmail.parameters.subject = "={{ $json.subject }}";
applicantEmail.parameters.message = "={{ $json.body }}";
applicantEmail.parameters.options = {};

const ownerEmail = node(onboarding, "Notify Owner");
ownerEmail.parameters.sendTo = "={{ $('Configuration').item.json.ownerEmail }}";
ownerEmail.parameters.subject =
  "={{ 'New Artist Application – ' + $('Normalize Application').item.json.name + ' – ' + $('Parse Summary').item.json.applicationId }}";
ownerEmail.parameters.message = `={{ \`A new artist application has been submitted.

Application ID: \${$('Parse Summary').item.json.applicationId}
Submitted: \${$('Parse Summary').item.json.submittedAt}

PERSONAL INFORMATION
Full Name: \${$('Normalize Application').item.json.name}
Email: \${$('Normalize Application').item.json.email}
Location: \${$('Normalize Application').item.json.location}
Website / Instagram: \${$('Normalize Application').item.json.website}

ARTISTIC INFORMATION
Primary Medium: \${$('Normalize Application').item.json.medium}
Art Style / Genre: \${$('Normalize Application').item.json.style}
Years Active: \${$('Normalize Application').item.json.yearsActive}
Representation History: \${$('Normalize Application').item.json.representationHistory}

PORTFOLIO
Portfolio Website: \${$('Normalize Application').item.json.portfolio}
Uploaded Files: No files were delivered by the current website endpoint. Review the portfolio links above.

ABOUT THE ARTIST
Bio:
\${$('Normalize Application').item.json.bio}

Artist Statement:
\${$('Normalize Application').item.json.statement}

Consent Accepted: \${$('Normalize Application').item.json.consent}

Review the application in the Gallery AI dashboard.\` }}`;
ownerEmail.parameters.options = {
  replyTo: "={{ $('Normalize Application').item.json.email }}",
};
addLogNode(onboarding, "Notify Owner", [1320, 0]);

const opportunities = workflow(activeIds.opportunities);
configuration(opportunities);
const rss = node(opportunities, "Read RSS Feed");
rss.type = "n8n-nodes-base.rssFeedRead";
rss.typeVersion = 1.2;
rss.parameters = { url: "={{ $json.url }}" };
rss.onError = "continueRegularOutput";

node(opportunities, "Limit and Normalize").parameters.jsCode = `const now = Date.now();
const seen = new Set();
return $input.all().slice(0, 150).map(({ json }) => {
  const title = String(json.title || "").trim();
  const link = String(json.link || "").trim();
  const published = json.isoDate || json.pubDate || "";
  const summary = String(json.contentSnippet || json.content || "").slice(0, 1200);
  const deadlineMatch = summary.match(/(?:deadline|closes?|due)[:\\s-]*([A-Z][a-z]{2,8}\\s+\\d{1,2}(?:,\\s+\\d{4})?|\\d{4}-\\d{2}-\\d{2})/i);
  const deadline = deadlineMatch?.[1] || "";
  return { json: { title, link, published, summary, deadline } };
}).filter(({ json }) => {
  if (!json.title || !json.link || seen.has(json.link)) return false;
  seen.add(json.link);
  if (!json.deadline) return true;
  const parsed = Date.parse(json.deadline);
  return Number.isNaN(parsed) || parsed >= now;
});`;

node(opportunities, "Match Opportunities").parameters.jsCode = `const data = $json;
const artists = data.artists || [];
const opportunityItems = data.opportunities || [];
const state = $getWorkflowStaticData("global");
const matches = [];
for (const opportunity of opportunityItems) {
  if (!opportunity.link || state[opportunity.link]) continue;
  const text = (opportunity.title + " " + opportunity.summary).toLowerCase();
  const artist = artists.find((candidate) => {
    const style = String(candidate.Style || candidate.Medium || "").toLowerCase();
    const location = String(candidate.Location || "").toLowerCase();
    return (style && text.includes(style)) || (location && text.includes(location));
  });
  if (!artist) continue;
  state[opportunity.link] = new Date().toISOString();
  matches.push({
    title: opportunity.title,
    link: opportunity.link,
    deadline: opportunity.deadline || "",
    matchedArtist: artist.Name || "",
    reason: "The published opportunity text matches the artist's recorded medium, style, or location.",
  });
}
console.log(JSON.stringify({ event: "AGENT_TRIGGERED", agent: "Opportunity Finder", candidates: opportunityItems.length, matches: matches.length, timestamp: new Date().toISOString() }));
return [{ json: { matches } }];`;

node(opportunities, "Parse Matches").parameters.jsCode =
  'if (!Array.isArray($json.matches)) throw new Error("Missing matches array"); return [{ json: $json }];';
node(opportunities, "Prepare Digest").parameters.jsCode = `const matches = $("Parse Matches").item.json.matches;
if (!matches.length) {
  console.log(JSON.stringify({ event: "AGENT_COMPLETED", agent: "Opportunity Finder", result: "NO_NEW_MATCHES", timestamp: new Date().toISOString() }));
  return [];
}
const lines = matches.map((match) => "• " + match.title + "\\n  Artist: " + match.matchedArtist + "\\n  Deadline: " + (match.deadline || "Not stated") + "\\n  " + match.link + "\\n  Why: " + match.reason).join("\\n\\n");
return [{ json: {
  subject: "New Gallery Opportunities – " + matches.length + " match" + (matches.length === 1 ? "" : "es"),
  body: "Meaningful new opportunity matches for review\\n\\n" + lines + "\\n\\nVerify eligibility and deadlines at the original links before acting.",
} }];`;

const digest = node(opportunities, "Create Digest Draft");
delete digest.parameters.resource;
digest.parameters.sendTo = "={{ $('Configuration').item.json.ownerEmail }}";
digest.parameters.subject = "={{ $json.subject }}";
digest.parameters.message = "={{ $json.body }}";
digest.parameters.options = {};
opportunities.nodes = opportunities.nodes.filter(
  (item) => item.name !== "Notify Owner",
);
addLogNode(opportunities, "Create Digest Draft", [1600, 0]);

const collector = workflow(activeIds.collector);
configuration(collector);
const normalizeInquiry = node(collector, "Normalize Inquiry");
normalizeInquiry.parameters.assignments.assignments.push({
  id: "inquiry-message-id",
  name: "messageId",
  value:
    "={{ $('Collector Inquiry Label').item.json.id || $('Collector Inquiry Label').item.json.messageId || '' }}",
  type: "string",
});

node(collector, "Extract Collector Profile").parameters.jsCode = `const inquiry = $("Normalize Inquiry").item.json;
const state = $getWorkflowStaticData("global");
const key = inquiry.messageId || (inquiry.sender + "|" + inquiry.subject + "|" + inquiry.body);
if (state[key]) {
  console.log(JSON.stringify({ event: "AGENT_COMPLETED", agent: "Collector Assistant", duplicate: true, timestamp: new Date().toISOString() }));
  return [];
}
state[key] = new Date().toISOString();
const budget = inquiry.body.match(/(?:budget|up to|around)\\s*[:$]?\\s*([A-Z]{0,3}\\s?\\$?[\\d,.]+(?:\\s*[-–]\\s*\\$?[\\d,.]+)?)/i)?.[1] || "";
const styles = ["abstract", "contemporary", "figurative", "landscape", "minimalist", "photography", "sculpture"];
const preferredStyle = styles.find((style) => inquiry.body.toLowerCase().includes(style)) || "";
const name = String(inquiry.sender || "").split("@")[0].replace(/[._-]+/g, " ");
console.log(JSON.stringify({ event: "AGENT_TRIGGERED", agent: "Collector Assistant", inquiryId: key, timestamp: new Date().toISOString() }));
return [{ json: { name, budget, preferredStyle, interests: inquiry.body.slice(0, 1500) } }];`;
node(collector, "Parse Collector Profile").parameters.jsCode =
  'return [{ json: $json }];';

const notifyCollectorOwner = node(collector, "Notify Owner");
notifyCollectorOwner.parameters.subject =
  "={{ 'Collector follow-up required – ' + $('Normalize Inquiry').item.json.subject }}";
notifyCollectorOwner.parameters.message = `={{ \`A collector inquiry requires human follow-up.

Collector: \${$('Parse Collector Profile').item.json.name}
Email: \${$('Normalize Inquiry').item.json.sender}
Budget: \${$('Parse Collector Profile').item.json.budget || 'Not stated'}
Style / interests: \${$('Parse Collector Profile').item.json.preferredStyle || 'Not stated'}

Inquiry:
\${$('Normalize Inquiry').item.json.body}

A draft reply is ready in Gmail. Confirm availability, pricing, dimensions, provenance, and shipping terms before sending.\` }}`;
notifyCollectorOwner.parameters.options = {
  replyTo: "={{ $('Normalize Inquiry').item.json.sender }}",
};
addLogNode(collector, "Notify Owner", [1640, 0]);

for (const repaired of [onboarding, opportunities, collector]) {
  repaired.active = true;
  repaired.versionId = crypto.randomUUID();
  repaired.updatedAt = new Date().toISOString();
  repaired.nodes.forEach((item) => {
    if (item.parameters?.jsCode?.includes("AQ.")) {
      throw new Error(`${repaired.name}: embedded API credential remains`);
    }
  });
}

const output = [onboarding, opportunities, collector];
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(
  `Wrote ${output.length} repaired active workflows to ${outputPath}`,
);
