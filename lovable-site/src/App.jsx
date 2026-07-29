import { useState } from "react";

const agents = [
  {
    number: "01",
    title: "Artist onboarding",
    image: "/assets/gallery/artist-onboarding.avif",
    description:
      "Captures artist information, creates a concise AI-assisted summary, updates the database, and prepares communication.",
  },
  {
    number: "02",
    title: "Opportunity finder",
    image: "/assets/gallery/opportunity-finder.avif",
    description:
      "Reviews opportunities against artist profiles and records relevant matches for follow-up.",
  },
  {
    number: "03",
    title: "Collector assistant",
    image: "/assets/gallery/collector-assistant.avif",
    description:
      "Uses collector preferences and available artwork data to prepare thoughtful recommendations.",
  },
  {
    number: "04",
    title: "Weekly gallery report",
    image: "/assets/gallery/weekly-report.avif",
    description:
      "Combines Sheets and Calendar data, generates an operational summary, and creates a Gmail draft for review.",
  },
];

const steps = [
  ["Google Sheets", "Where your records live", "Your artists, artworks, collectors and enquiries sit in ordinary spreadsheets. Nothing new to learn — you keep updating the sheet you already use."],
  ["Google Calendar", "What's coming up", "Shows, studio visits, install days and submission deadlines are read from your calendar so the system knows what matters this week."],
  ["n8n", "The automation layer", "Think of it as the wiring. It watches for a new row or a new date, then passes the right information to the right place — on a schedule or the moment something changes."],
  ["Local Qwen AI", "The writing and summarising", "An AI model running on your own machine through Ollama. It reads the gathered information and writes the summary, match note or email. Because it runs locally, your gallery data never leaves your computer."],
  ["Gmail draft", "You get the last word", "The finished text lands in your Gmail as a draft. You read it, edit anything you like, and press send. Nothing is sent on your behalf."],
];

export function App() {
  const [active, setActive] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);

  function sendMessage(text = message) {
    if (!text.trim()) return;
    setMessage("");
    setReply(
      text.toLowerCase().includes("data")
        ? "Your gallery data stays under your control. The Qwen model runs locally through Ollama."
        : "Gallery AI connects your sheets, calendar, n8n workflows, local AI, and Gmail drafts. A person reviews everything before it is sent."
    );
  }

  return (
    <div className="site-shell">
      <header className="nav">
        <a className="brand" href="#top">Gallery AI</a>
        <div className="nav-links">
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
            <p className="eyebrow">Private-first gallery automation</p>
            <h1>Less admin.<br /><em>More art.</em></h1>
            <p className="lead">An n8n automation system that connects gallery data, calendars, Gmail, and a locally running Qwen model to support artist onboarding, opportunity discovery, collector assistance, and weekly reporting.</p>
            <div className="actions">
              <a className="primary" href="#workflows">Explore the workflows</a>
              <a href="https://sidm13.github.io/Gallery-AI--Agent-/run/">Run on your machine</a>
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
        </section>

        <section className="section how">
          <p className="eyebrow">How it works</p>
          <h2>One clear automation path.</h2>
          <p className="intro">Five parts, each with one job. Here's what each one actually does.</p>
          <ol className="step-list">
            {steps.map(([title, subtitle, body], index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{title}</h3><b>{subtitle}</b><p>{body}</p></div>
              </li>
            ))}
          </ol>
          <div className="flow">{steps.map(([title], i) => <div key={title}><span>{title}</span>{i < steps.length - 1 && <b>→</b>}</div>)}</div>
        </section>

        <section className="privacy">
          <p className="eyebrow">Design principle</p>
          <h2>Your gallery data stays under your control.</h2>
          <p>The AI model runs locally through Ollama. The included workflows are designed for human review, use environment-based configuration, and keep credentials out of the repository.</p>
        </section>

        <section id="contact" className="section contact">
          <div>
            <p className="eyebrow">Contact us</p>
            <h2>Interested for your gallery?</h2>
            <p>Tell us a little about your gallery and how you work today. We'll get back to you with what setting this up would look like.</p>
          </div>
          {sent ? <div className="thanks"><h3>Thank you.</h3><p>Your enquiry has been prepared for the Gallery AI team.</p></div> : (
            <form onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
              <label>Your name<input required /></label>
              <label>Gallery<input required /></label>
              <label>Email<input required type="email" /></label>
              <label>What would you like to automate?<textarea rows="4" /></label>
              <button>Send enquiry</button>
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
