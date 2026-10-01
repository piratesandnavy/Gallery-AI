import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BarChart3, Calendar, FileText, Mail, MessageCircle, Sparkles, X } from "lucide-react";

const BOOKING_URL = "https://cal.com/purmehdi/30min";

// The Cal.com embed handles clicks on [data-cal-link] itself. If its script
// never loaded (blocked, offline), open the booking page in a new tab instead.
function openBookingFallback() {
  const embedReady = typeof window.Cal === "function" && Boolean(window.customElements?.get("cal-modal-box"));
  if (!embedReady) window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
}

const agents = [
  {
    number: "01",
    title: "Artist Relations Assistant",
    tagline: "Every artist relationship, on track",
    url: "https://nex3.app.n8n.cloud/workflow/sQ80p48AY4LWG5qb",
    image: "/assets/gallery/roundcarousel-eec164e9.png",
    description: "Tracks conversations, follow-ups, and milestones for each artist, keeping a full relationship history so nothing important falls through the cracks.",
  },
  {
    number: "02",
    title: "Opportunity Scout",
    tagline: "New openings, found before the deadline",
    url: "https://nex3.app.n8n.cloud/workflow/MbZsQNgCMQxIcHs1",
    image: "/assets/gallery/opportunity-finder.avif",
    description: "Scans for new gallery opportunities and organizes promising leads into a review list, giving your team more time to prepare strong applications.",
  },
  {
    number: "03",
    title: "Finance & Sales Admin Assistant",
    tagline: "Less admin, cleaner books",
    url: "https://nex3.app.n8n.cloud/workflow/cH1Xmg4hyQB2CeFK",
    image: "/assets/gallery/roundcarousel-ed7b1c40.png",
    description: "Handles routine sales administration, finance follow-ups, and operational reminders so your team spends less time on paperwork and more on clients.",
  },
  {
    number: "04",
    title: "Chief of Staff (orchestrator)",
    tagline: "One request, routed to the right agent",
    url: "https://nex3.app.n8n.cloud/workflow/Cxl4i0nP8pTI5ztx",
    image: "/assets/gallery/artist-onboarding.avif",
    description: "Coordinates the full agent team, sending each task to the right workflow so gallery operations run as one connected system.",
  },
  {
    number: "05",
    title: "Collector CRM Assistant",
    tagline: "Know every collector, every time",
    url: "https://nex3.app.n8n.cloud/workflow/f5HaInPvbCqiTRjX",
    image: "/assets/gallery/collector-assistant.avif",
    description: "Maintains each collector's preferences, conversation history, and buying signals in one place, so your team always knows who to contact and why.",
  },
  {
    number: "06",
    title: "Inventory Agent",
    tagline: "Inventory records you can trust",
    url: "https://nex3.app.n8n.cloud/workflow/3mOlGImOOQ8E7xP1",
    image: "/assets/gallery/weekly-report.avif",
    description: "Organizes artwork records, movement details, and documentation, keeping inventory accurate and audit-ready as works are loaned, shipped, or sold.",
  },
  {
    number: "07",
    title: "Content & Marketing Assistant",
    tagline: "Campaigns drafted, ready for your voice",
    url: "https://nex3.app.n8n.cloud/workflow/Y8ttUTKH9LYlF1Jn",
    image: "/assets/gallery/roundcarousel-e60dd7f7.png",
    description: "Prepares exhibition content, campaign ideas, and marketing drafts for your review, helping you promote shows consistently without starting from a blank page.",
  },
];

const steps = [
  ["Artist Database", "Artist profiles, artworks and collectors", "Your artists, artworks, collectors and enquiries stay in the spreadsheets you already use."],
  ["Smart Calendar", "Exhibitions, deadlines and appointments", "Shows, studio visits, install days and deadlines are read from your calendar so nothing is missed."],
  ["Automation Engine", "Change detection and smart workflows", "The automation engine works behind the scenes to keep your gallery organized by automatically managing updates and workflows."],
  ["AI Assistant", "Summaries, drafts and reports", "A Large Language Model (LLM) reviews your gallery information and generates summaries, email drafts, and valuable insights."],
  ["Review & Send", "Edit and send with confidence", "The finished text lands as a draft. You review it, edit it, and press send yourself."],
];

const integrations = {
  "Artist Database": [
    ["Google Sheets", "/integrations/google-sheets.svg"],
    ["Airtable", "/integrations/airtable.svg"],
    ["Notion", "/integrations/notion.svg"],
  ],
  "Smart Calendar": [
    ["Google Calendar", "/integrations/google-calendar.svg"],
    ["Calendly", "/integrations/calendly.svg"],
    ["Microsoft Outlook", "/integrations/microsoft-outlook.svg"],
  ],
  "Automation Engine": [
    ["n8n", "/integrations/n8n.svg"],
    ["Zapier", "/integrations/zapier.svg"],
    ["Make", "/integrations/make.svg"],
  ],
  "AI Assistant": [
    ["OpenAI ChatGPT", "/integrations/openai.svg"],
    ["Anthropic Claude", "/integrations/anthropic.svg"],
    ["Google Gemini", "/integrations/google-gemini.svg"],
  ],
  "Review & Send": [
    ["Gmail", "/integrations/gmail.svg"],
    ["Microsoft Outlook", "/integrations/microsoft-outlook.svg"],
    ["Google Workspace", "/integrations/google-workspace.png"],
  ],
};

export function App() {
  const [activeAgent, setActiveAgent] = useState(0);
  const dragStart = useRef(null);
  const heroRef = useRef(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactError, setContactError] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState("summaries");

  const assistantPanels = {
    summaries: {
      eyebrow: "Latest artist summary",
      title: "Mara Vela — onboarding brief",
      body: "Vancouver-based multidisciplinary artist working across textile, sculpture, and installation. Current practice explores memory, migration, and domestic archives. Available for group exhibitions from October 2026.",
      meta: ["Artist profile", "Updated 12 min ago", "Ready for review"],
    },
    drafts: {
      eyebrow: "Prepared email draft",
      title: "Studio visit follow-up",
      body: "Hi Mara, thank you for sharing your portfolio and availability. We would love to continue the conversation with a studio visit in September. I’ve included three possible times below for your review.",
      meta: ["Gmail draft", "Not sent", "Human approval required"],
    },
    reports: {
      eyebrow: "Weekly gallery insight",
      title: "Opportunities are up 18%",
      body: "Seven relevant opportunities were identified this week. Three match artists currently preparing new bodies of work, and two deadlines fall within the next fourteen days.",
      meta: ["7 matches", "2 approaching deadlines", "Generated Friday"],
    },
  };

  const assistantNav = [
    ["summaries", "Summaries", FileText],
    ["drafts", "Email drafts", Mail],
    ["reports", "Reports & insights", BarChart3],
  ];

  function moveAgent(direction) {
    setActiveAgent((current) => (current + direction + agents.length) % agents.length);
  }

  function agentOffset(index) {
    let offset = index - activeAgent;
    if (offset > agents.length / 2) offset -= agents.length;
    if (offset < -agents.length / 2) offset += agents.length;
    return offset;
  }

  useEffect(() => {
    const targets = document.querySelectorAll(".section, .privacy, .contact, footer");
    targets.forEach((target) => target.classList.add("motion-section"));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      }),
      { threshold: 0.12, rootMargin: "0px 0px -8%" }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateHero = () => {
      frame = 0;
      const hero = heroRef.current;
      if (!hero) return;
      const bounds = hero.getBoundingClientRect();
      const distance = Math.max(1, hero.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -bounds.top / distance));
      hero.style.setProperty("--scroll-progress", progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHero);
    };
    updateHero();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  function sendMessage(text = message) {
    if (!text.trim()) return;
    setMessage("");
    setReply(
      text.toLowerCase().includes("data")
        ? "Your gallery data stays under your control. The Qwen model runs locally through Ollama."
        : "Gallery AI connects your sheets, calendar, n8n workflows, local AI, and Gmail drafts. A person reviews everything before it is sent."
    );
  }

  async function submitContact(event) {
    event.preventDefault();
    setSending(true);
    setContactError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "The enquiry could not be sent.");
      }
      setSent(true);
    } catch (error) {
      setContactError(error.message || "The enquiry could not be sent.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="site-shell">
      <header className="nav">
        <a className="brand" href="#top">Gallery AI</a>
        <div className="nav-links">
          <a href="#workflows">Agents</a>
          <a href="https://nex3.app.n8n.cloud/home/workflows">Cloud workspace ↗</a>
          <a href="#contact">Contact</a>
        </div>
      </header>

      <main id="top">
        <section
          className="hero"
          ref={heroRef}
          onPointerMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty("--mouse-x", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 2}`);
            event.currentTarget.style.setProperty("--mouse-y", `${((event.clientY - bounds.top) / bounds.height - 0.5) * 2}`);
          }}
          onPointerLeave={(event) => {
            event.currentTarget.style.setProperty("--mouse-x", "0");
            event.currentTarget.style.setProperty("--mouse-y", "0");
          }}
        >
          <div className="hero-sticky">
            <div className="tunnel" aria-hidden="true">
              {Array.from({ length: 16 }, (_, i) => <span key={i} style={{ "--i": i }} />)}
              <div className="tunnel-gallery">
                {agents.slice(0, 8).map((agent, index) => (
                  <figure key={agent.title} style={{ "--panel": index }}>
                    <img src={agent.image} alt="" />
                  </figure>
                ))}
              </div>
            </div>
            <div className="hero-copy">
              <p className="eyebrow">Live gallery automation</p>
              <h1>Less admin.<br /><em style={{ fontStyle: "italic", color: "#FF7518" }}>More art.</em></h1>
              <p className="lead">An AI automation system that connects gallery data, calendars, email, and private or commercial AI models to support artist onboarding, opportunity discovery, collector assistance, and weekly reporting.</p>
              <div className="actions">
                <a className="primary" href="#workflows">Explore the workflows</a>
                <a href="https://nex3.app.n8n.cloud/home/workflows">Open Gallery AI Cloud</a>
                <a href="https://github.com/piratesandnavy/Gallery-AI">Run on your machine</a>
                <a href="#contact">Contact us</a>
              </div>
            </div>
          </div>
        </section>

        <section id="workflows" className="section workflows">
          <p className="eyebrow">Seven connected roles</p>
          <h2>Built around real gallery work.</h2>
          <p className="intro">Click a card, drag sideways, or use the arrows to move through the connected gallery workflows.</p>
          <div
            className="agent-stage"
            role="group"
            tabIndex="0"
            aria-label="Connected gallery agents"
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") moveAgent(-1);
              if (event.key === "ArrowRight") moveAgent(1);
            }}
            onPointerDown={(event) => { dragStart.current = event.clientX; }}
            onPointerUp={(event) => {
              if (dragStart.current !== null && Math.abs(event.clientX - dragStart.current) > 35) moveAgent(event.clientX < dragStart.current ? 1 : -1);
              dragStart.current = null;
            }}
          >
            <button className="agent-arrow agent-arrow-left" onClick={() => moveAgent(-1)} aria-label="Previous agent"><ArrowLeft size={18} /></button>
            <div className="agent-ring">
            {agents.map((agent, index) => {
              const offset = agentOffset(index);
              const distance = Math.abs(offset);
              return (
                <article
                  className="agent-card"
                  key={agent.title}
                  aria-current={index === activeAgent ? "true" : undefined}
                  aria-hidden={distance > 2}
                  onClick={() => setActiveAgent(index)}
                  style={{ "--offset": offset, "--distance": distance, "--card-opacity": distance > 2 ? 0 : index === activeAgent ? 1 : 0.58, "--card-z": 20 - distance }}
                >
                  <img src={agent.image} alt={agent.title} />
                  <span className="card-shade" />
                  <span className="card-copy">
                    <b>{agent.number}</b>
                    <strong>{agent.title}</strong>
                    <em>{agent.tagline}</em>
                    <small>{agent.description}</small>
                    {index === activeAgent && <a href={agent.url}>Open agent ↗</a>}
                  </span>
                </article>
              );
            })}
            </div>
            <button className="agent-arrow agent-arrow-right" onClick={() => moveAgent(1)} aria-label="Next agent"><ArrowRight size={18} /></button>
          </div>
          <div className="agent-dots" aria-label="Choose an agent">
            {agents.map((agent, index) => <button key={agent.title} className={index === activeAgent ? "active" : ""} onClick={() => setActiveAgent(index)} aria-label={`Show ${agent.title}`} />)}
          </div>
        </section>

        <section className="section how">
          <p className="eyebrow">Five connected modules</p>
          <h2>The AI Gallery Operating System</h2>
          <p className="intro">Five modules. One intelligent gallery.</p>
          <ol className="step-list">
            {steps.map(([title, subtitle, body], index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{title}</h3><b>{subtitle}</b><p>{body}</p>
                  <div className="integration-logos" role="group" aria-label={`${title} integrations`}>
                    {integrations[title].map(([name, src]) => (
                      <span className="integration-logo" key={name} title={name}>
                        <img src={src} alt={`${name} logo`} aria-label={name} loading="lazy" />
                      </span>
                    ))}
                  </div>
                  {title === "AI Assistant" && <button className="text-action" onClick={() => setAssistantOpen(true)}>Open assistant workspace <ArrowRight size={15} /></button>}
                </div>
              </li>
            ))}
          </ol>
          <div className="flow">{steps.map(([title], i) => <div key={title}><span>{title}</span>{i < steps.length - 1 && <b>→</b>}</div>)}</div>
          <div className="operating-note">
            <strong>Connected. Automated. Intelligent.</strong>
            <span>More time for art. Less time for admin.</span>
          </div>
        </section>

        <section className="privacy">
          <div className="privacy-copy">
            <p className="eyebrow">Design principle</p>
            <h2>Your gallery stays in control.</h2>
            <p>The workflows are designed for human review, use environment-based configuration, keep credentials out of the repository, and prepare drafts before client-facing communication is sent.</p>
          </div>
          <figure className="privacy-visual">
            <img
              src="/assets/gallery/more-time-for-art-less-admin.png"
              alt="A gallery director walking through a warmly lit exhibition space connected by Gallery AI workflows"
              loading="lazy"
            />
          </figure>
        </section>

        <section id="contact" className="section contact">
          <div>
            <p className="eyebrow">Contact us</p>
            <h2>Interested for your gallery?</h2>
            <p>Tell us a little about your gallery and how you work today. We'll get back to you with what setting this up would look like.</p>
          </div>
          {sent ? <div className="thanks"><h3>Thank you.</h3><p>Your enquiry has been prepared for the Gallery AI team.</p></div> : (
            <form onSubmit={submitContact}>
              <label>Your name<input name="name" required maxLength="100" /></label>
              <label>Gallery<input name="gallery" maxLength="120" /></label>
              <label>Email<input name="email" required type="email" maxLength="255" /></label>
              <label>What would you like to automate?<textarea name="message" rows="4" maxLength="1000" /></label>
              {contactError && <p className="form-error" role="alert">{contactError}</p>}
              <div className="contact-actions">
                <button className="contact-submit" disabled={sending}>{sending ? "Sending…" : "Send enquiry"}</button>
                <button
                  className="contact-submit contact-book"
                  type="button"
                  aria-label="Book a 30 minute discovery call"
                  data-cal-link="purmehdi/30min"
                  data-cal-namespace="30min"
                  data-cal-config={JSON.stringify({ layout: "month_view", useSlotsViewOnSmallScreen: "true" })}
                  onClick={openBookingFallback}
                >
                  <Calendar size={17} aria-hidden="true" />
                  Book a Discovery Call
                </button>
                <button
                  className="contact-chat"
                  type="button"
                  aria-label="Begin onboarding with the Gallery AI assistant"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageCircle size={17} aria-hidden="true" />
                  Begin Onboarding with AI
                </button>
              </div>
            </form>
          )}
        </section>
      </main>

      <footer><span>Gallery AI</span><span>Private-first gallery automation.</span></footer>

      <button className="chat-trigger" aria-label={chatOpen ? "Close assistant" : "Ask the Gallery AI assistant"} onClick={() => setChatOpen(!chatOpen)}>✦</button>
      {chatOpen && (
        <aside className="chat" aria-label="Gallery AI assistant">
          <div className="chat-head"><div><b>Gallery AI assistant</b><small>Ask anything, or leave your details.</small></div><button onClick={() => setChatOpen(false)}>×</button></div>
          <div className="messages">
            <p>I can explain how the five agents work, what stays on your machine, and pass your details to the team.</p>
            {reply && <p className="reply">{reply}</p>}
          </div>
          <div className="suggestions">
            {["What does Gallery AI actually do?", "Does my gallery data leave my computer?", "I'm interested — how do we start?"].map(q => <button key={q} onClick={() => sendMessage(q)}>{q}</button>)}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
            <input aria-label="Ask about Gallery AI..." value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask about Gallery AI..." />
            <button aria-label="Submit">↑</button>
          </form>
        </aside>
      )}

      {assistantOpen && (
        <div className="assistant-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setAssistantOpen(false)}>
          <section className="assistant-workspace" role="dialog" aria-modal="true" aria-label="Gallery AI assistant workspace">
            <header className="assistant-titlebar">
              <a className="brand" href="#top">Gallery AI</a>
              <button aria-label="Close assistant workspace" onClick={() => setAssistantOpen(false)}><X size={20} /></button>
            </header>
            <div className="assistant-layout">
              <aside className="assistant-card">
                <span className="assistant-mark"><Sparkles size={31} /></span>
                <p className="eyebrow">Private-first intelligence</p>
                <h2>AI Assistant</h2>
                <p>An approved model reads what your gallery has gathered and prepares summaries, email drafts, and operational insight for review.</p>
                <nav aria-label="Assistant views">
                  {assistantNav.map(([id, label, Icon]) => (
                    <button key={id} className={assistantMode === id ? "active" : ""} onClick={() => setAssistantMode(id)}>
                      <Icon size={20} /><span>{label}</span><ArrowRight size={16} />
                    </button>
                  ))}
                </nav>
              </aside>
              <article className="assistant-output" aria-live="polite">
                <div className="output-head"><span className="status-dot" /> Local model ready</div>
                <p className="eyebrow">{assistantPanels[assistantMode].eyebrow}</p>
                <h3>{assistantPanels[assistantMode].title}</h3>
                <p className="output-copy">{assistantPanels[assistantMode].body}</p>
                <div className="output-meta">{assistantPanels[assistantMode].meta.map(item => <span key={item}>{item}</span>)}</div>
                <div className="review-note"><b>Nothing sends automatically.</b><span>Review, edit, and approve every client-facing action.</span></div>
                <div className="output-actions"><a href="https://nex3.app.n8n.cloud/home/workflows">Open in workspace</a><button className="quiet" onClick={() => setAssistantOpen(false)}>Done</button></div>
              </article>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
