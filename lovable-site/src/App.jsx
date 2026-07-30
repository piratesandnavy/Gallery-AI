import { useState } from "react";

const agents = [
  {
    number: "01",
    title: "Artist onboarding",
    url: "https://gallery-ai-production-d094.up.railway.app/workflow/mjoQ3fQc1eE3ALqx",
    image: "/assets/gallery/artist-onboarding.avif",
    description:
      "Captures artist information, creates a concise AI-assisted summary, updates the database, and prepares communication.",
  },
  {
    number: "02",
    title: "Opportunity finder",
    url: "https://gallery-ai-production-d094.up.railway.app/workflow/tdb1ZbGSeIGyExKX",
    image: "/assets/gallery/opportunity-finder.avif",
    description:
      "Reviews opportunities against artist profiles and records relevant matches for follow-up.",
  },
  {
    number: "03",
    title: "Collector assistant",
    url: "https://gallery-ai-production-d094.up.railway.app/workflow/SXASSCLEd5HVQEF7",
    image: "/assets/gallery/collector-assistant.avif",
    description:
      "Uses collector preferences and available artwork data to prepare thoughtful recommendations.",
  },
  {
    number: "04",
    title: "Weekly gallery report",
    url: "https://gallery-ai-production-d094.up.railway.app/workflow/w26K1uJ7ZdB8ZN3w",
    image: "/assets/gallery/weekly-report.avif",
    description:
      "Combines Sheets and Calendar data, generates an operational summary, and creates a Gmail draft for review.",
  },
];

const steps = [
  ["Artist Database", "Artist profiles, artworks and collectors", "Your artists, artworks, collectors and enquiries stay in the spreadsheets you already use."],
  ["Smart Calendar", "Exhibitions, deadlines and appointments", "Shows, studio visits, install days and deadlines are read from your calendar so nothing is missed."],
  ["Automation Engine", "Change detection and smart workflows", "The automation layer spots a new row or date and passes the right information to the right place."],
  ["AI Assistant", "Summaries, drafts and reports", "An approved private or commercial AI model reads what was gathered and prepares the summary or email."],
  ["Review & Send", "Edit and send with confidence", "The finished text lands as a draft. You review it, edit it, and press send yourself."],
];

export function App() {
  const [active, setActive] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactError, setContactError] = useState("");

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
          <a href="https://gallery-ai-production-d094.up.railway.app/home/workflows">Cloud workspace ↗</a>
          <a href="#contact">Contact</a>
          <a href="https://github.com/piratesandnavy/Gallery-AI">View source ↗</a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="tunnel" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => <span key={i} style={{ "--i": i }} />)}
          </div>
          <div className="hero-copy">
            <p className="eyebrow">Live gallery automation</p>
            <h1>Less admin.<br /><em>More art.</em></h1>
            <p className="lead">An AI automation system that connects gallery data, calendars, email, and private or commercial AI models to support artist onboarding, opportunity discovery, collector assistance, and weekly reporting.</p>
            <div className="actions">
              <a className="primary" href="#workflows">Explore the workflows</a>
              <a href="https://gallery-ai-production-d094.up.railway.app/home/workflows">Open Gallery AI Cloud</a>
              <a href="https://github.com/piratesandnavy/Gallery-AI">Run on your machine</a>
              <a href="#contact">Contact us</a>
            </div>
          </div>
        </section>

        <section id="workflows" className="section workflows">
          <p className="eyebrow">Four connected agents</p>
          <h2>Built around real gallery work.</h2>
          <p className="intro">Click a card, drag sideways, scroll horizontally, or use the arrow keys to move through the workflows.</p>
          <div className="agent-stage">
            <button className="arrow left" disabled={active === 0} onClick={() => setActive(Math.max(0, active - 1))} aria-label="Previous agent">←</button>
            <div className="agent-cards">
              {agents.map((agent, index) => (
                <button
                  className={`agent-card ${index === active ? "active" : ""}`}
                  key={agent.title}
                  onClick={() => setActive(index)}
                  aria-label={agent.title}
                >
                  <img src={agent.image} alt={agent.title} />
                  <span className="card-shade" />
                  <span className="card-copy">
                    <b>{agent.number}</b>
                    <strong>{agent.title}</strong>
                    <small>{agent.description}</small>
                  </span>
                </button>
              ))}
            </div>
            <button className="arrow right" disabled={active === agents.length - 1} onClick={() => setActive(Math.min(agents.length - 1, active + 1))} aria-label="Next agent">→</button>
          </div>
          <div className="dots">
            {agents.map((a, i) => <button aria-label={`Show ${a.title}`} className={i === active ? "selected" : ""} onClick={() => setActive(i)} key={a.title} />)}
          </div>
          <div className="active-agent">
            <div>
              <span>Published agent {agents[active].number}</span>
              <strong>{agents[active].title}</strong>
              <small>Sign in to the Gallery AI workspace to view executions, configuration, and workflow history.</small>
            </div>
            <a href={agents[active].url}>Open agent ↗</a>
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
                <div><h3>{title}</h3><b>{subtitle}</b><p>{body}</p></div>
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
          <p className="eyebrow">Design principle</p>
          <h2>Your gallery stays in control.</h2>
          <p>The workflows are designed for human review, use environment-based configuration, keep credentials out of the repository, and prepare drafts before client-facing communication is sent.</p>
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
              <button disabled={sending}>{sending ? "Sending…" : "Send enquiry"}</button>
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
            <p>I can explain how the four agents work, what stays on your machine, and pass your details to the team.</p>
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
    </div>
  );
}
