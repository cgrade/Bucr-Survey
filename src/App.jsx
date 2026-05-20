import { useState, useEffect, useRef } from "react";

// ── PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ──────────────────────────
const SHEET_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbx70p8GHu7k5LNGB709N1qcxvo0hC3K35J9B0S1vhobvYJO3ypi3R3ETZKfrngtkW3y8g/exec";
// ────────────────────────────────────────────────────────────────────────────

const NAVY = "#0f2547";
const NAVY2 = "#1a3c6e";
const GOLD = "#c9a84c";
const GOLD_L = "#e8d49a";
const CREAM = "#f5f0e8";
const MUTED = "#7a8fa6";
const BORDER = "rgba(201,168,76,0.28)";
const SURF = "rgba(255,255,255,0.04)";
const SURFL = "rgba(201,168,76,0.07)";

const questions = [
  {
    id: 1,
    tag: "Discovery",
    question:
      "What's the biggest frustration you face when trying to book a restaurant or plan a dining experience — and what would a perfect booking experience look like for you?",
    type: "textarea",
    placeholder: "Take your time, we genuinely want to know...",
  },
  {
    id: 2,
    tag: "Value",
    question: "On a scale of 1–10, how compelling is this idea to you?",
    subtext: `"An app where you book a table, drop a small refundable deposit to secure it, and earn rewards every time you show up — while also discovering the best restaurants, bars and lounges near you."`,
    type: "scale_plus_text",
    placeholder: "What do you like, dislike, or would change about that idea?",
  },
  {
    id: 3,
    tag: "Intent",
    question:
      "When planning a fine dining experience, what are you ultimately trying to achieve — and what most often gets in the way?",
    type: "textarea",
    placeholder: "Be as honest as you like...",
  },
  {
    id: 4,
    tag: "Priority",
    question:
      "If a dining app could only give you ONE of these, which would matter most to you?",
    type: "choice",
    options: [
      { label: "A", text: "Guaranteed table confirmation with zero stress" },
      { label: "B", text: "Rewards and credits every time you dine out" },
      {
        label: "C",
        text: "Discovering the best new restaurants and lounges near you",
      },
      { label: "D", text: "A seamless, one-tap booking experience" },
    ],
    followUp: "Why did you choose that?",
    followUpPlaceholder: "Tell us more...",
  },
  {
    id: 5,
    tag: "Fit",
    question:
      "Imagine an app that guarantees your table is always ready, rewards you with credits for showing up, and helps you discover great places to dine. How would you feel if it suddenly stopped existing?",
    type: "sentiment_plus_text",
    options: ["Very disappointed", "Somewhat disappointed", "Not disappointed"],
    placeholder: "Why did you choose that answer?",
  },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:   #0f2547;
    --navy2:  #1a3c6e;
    --gold:   #c9a84c;
    --gold-l: #e8d49a;
    --cream:  #f5f0e8;
    --muted:  #7a8fa6;
    --border: rgba(201,168,76,0.28);
    --surf:   rgba(255,255,255,0.04);
    --surfl:  rgba(201,168,76,0.07);
  }

  html, body { height: 100%; }

  body {
    background: var(--navy);
    color: var(--cream);
    font-family: 'Jost', sans-serif;
    font-weight: 300;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* subtle radial glow top-right */
  body::before {
    content: '';
    position: fixed; top: -120px; right: -120px;
    width: 480px; height: 480px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  /* PROGRESS BAR */
  .prog-wrap {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    height: 3px; background: rgba(201,168,76,0.12);
  }
  .prog-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--navy2), var(--gold), var(--gold-l));
    transition: width 0.55s cubic-bezier(0.4,0,0.2,1);
  }

  /* STEP DOTS */
  .step-dots {
    position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 6px; z-index: 100;
  }
  .step-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(201,168,76,0.2);
    transition: all 0.3s ease;
  }
  .step-dot.done  { background: var(--gold); }
  .step-dot.active { background: var(--gold-l); transform: scale(1.4); }

  /* SHELL */
  .shell {
    position: relative; z-index: 1;
    max-width: 460px; margin: 0 auto;
    padding: 0 24px 80px;
    min-height: 100vh;
  }

  /* LOGO BADGE */
  .logo-badge {
    display: flex; align-items: center; gap: 10px;
    justify-content: center; padding-top: 36px; margin-bottom: 8px;
  }
  .logo-line { flex: 1; height: 1px; background: var(--border); max-width: 60px; }
  .logo-text {
    font-family: 'Jost', sans-serif; font-weight: 600;
    font-size: 13px; letter-spacing: 0.3em; color: var(--gold);
  }

  /* INTRO */
  .intro {
    min-height: 100vh; display: flex; flex-direction: column;
    justify-content: center; padding: 56px 0;
    animation: fadeUp 0.8s ease both;
  }
  .intro-tag {
    font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--gold); text-align: center; margin-bottom: 20px;
  }
  .intro-ornament {
    width: 1px; height: 56px;
    background: linear-gradient(to bottom, transparent, var(--gold));
    margin: 0 auto 28px;
  }
  .intro-title {
    font-family: 'Cormorant Garamond', serif; font-weight: 300;
    font-size: clamp(34px, 9vw, 46px); line-height: 1.12;
    color: var(--cream); text-align: center; margin-bottom: 20px;
  }
  .intro-title em { font-style: italic; color: var(--gold-l); }
  .intro-body {
    font-size: 13.5px; line-height: 1.85; color: var(--muted);
    text-align: center; margin: 0 auto 36px; max-width: 320px;
  }
  .intro-cards {
    display: flex; justify-content: center; gap: 0;
    margin-bottom: 40px;
    border: 1px solid var(--border);
  }
  .intro-card {
    flex: 1; text-align: center;
    padding: 18px 12px;
    border-right: 1px solid var(--border);
  }
  .intro-card:last-child { border-right: none; }
  .intro-card-num {
    font-family: 'Cormorant Garamond', serif; font-size: 30px;
    color: var(--gold); display: block; line-height: 1;
  }
  .intro-card-label {
    font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--muted); display: block; margin-top: 6px;
  }
  .intro-divider { width: 32px; height: 1px; background: var(--border); margin: 0 auto 36px; }

  /* PRIMARY BUTTON */
  .btn {
    display: block; width: 100%;
    padding: 17px 32px;
    background: var(--gold);
    border: 1px solid var(--gold);
    color: var(--navy);
    font-family: 'Jost', sans-serif; font-size: 11px;
    font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase;
    cursor: pointer; transition: all 0.3s ease;
    position: relative; overflow: hidden;
  }
  .btn:hover { background: var(--gold-l); border-color: var(--gold-l); }
  .btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn.outline {
    background: transparent; color: var(--gold);
  }
  .btn.outline:hover { background: var(--surfl); }

  .btn-ghost {
    background: none; border: none; color: var(--muted);
    font-family: 'Jost', sans-serif; font-size: 12px; letter-spacing: 0.08em;
    cursor: pointer; padding: 12px 0;
    text-decoration: underline; text-underline-offset: 3px;
    transition: color 0.2s; display: block; width: 100%; text-align: center;
  }
  .btn-ghost:hover { color: var(--cream); }

  /* QUESTION SCREEN */
  .q-screen {
    min-height: 100vh; display: flex; flex-direction: column;
    padding-top: 64px;
    animation: fadeUp 0.45s ease both;
  }
  .q-header { margin-bottom: 36px; }
  .q-tag {
    font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 10px; display: block;
  }
  .q-num {
    font-family: 'Cormorant Garamond', serif; font-size: 13px;
    color: var(--muted); margin-bottom: 14px; display: block;
  }
  .q-text {
    font-family: 'Cormorant Garamond', serif; font-weight: 400;
    font-size: clamp(19px, 5vw, 25px); line-height: 1.45;
    color: var(--cream);
  }
  .q-subtext {
    font-family: 'Cormorant Garamond', serif; font-style: italic;
    font-size: 14.5px; line-height: 1.65; color: var(--gold-l);
    margin-top: 18px; padding: 14px 16px;
    border-left: 2px solid var(--gold);
    background: var(--surfl);
  }

  /* INPUTS */
  textarea {
    width: 100%; background: var(--surf);
    border: 1px solid var(--border);
    color: var(--cream); font-family: 'Jost', sans-serif;
    font-size: 14px; font-weight: 300; line-height: 1.7;
    padding: 14px 16px; resize: none; min-height: 138px;
    transition: border-color 0.25s, background 0.25s; outline: none;
    border-radius: 0;
  }
  textarea:focus { border-color: var(--gold); background: var(--surfl); }
  textarea::placeholder { color: var(--muted); }
  .char-count {
    font-size: 10px; color: var(--muted); text-align: right;
    margin-top: 5px; letter-spacing: 0.05em;
  }

  /* SCALE */
  .scale-wrap { margin-bottom: 22px; }
  .scale-labels {
    display: flex; justify-content: space-between;
    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 10px;
  }
  .scale-row { display: flex; gap: 5px; }
  .scale-btn {
    flex: 1; height: 46px;
    background: var(--surf); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif; font-size: 17px;
    color: var(--muted); cursor: pointer;
    transition: all 0.2s ease; user-select: none;
  }
  .scale-btn:hover { border-color: var(--gold); color: var(--gold-l); }
  .scale-btn.active {
    background: var(--gold); border-color: var(--gold);
    color: var(--navy); font-weight: 600;
  }

  /* CHOICES */
  .choices { display: flex; flex-direction: column; gap: 9px; margin-bottom: 22px; }
  .choice {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 14px 16px; border: 1px solid var(--border);
    background: var(--surf); cursor: pointer;
    transition: all 0.2s ease; user-select: none;
  }
  .choice:hover { border-color: rgba(201,168,76,0.5); background: var(--surfl); }
  .choice.active { border-color: var(--gold); background: var(--surfl); }
  .choice-lbl {
    font-family: 'Cormorant Garamond', serif; font-size: 20px;
    color: var(--gold); min-width: 18px; line-height: 1; padding-top: 1px;
  }
  .choice-txt { font-size: 13px; line-height: 1.6; color: var(--cream); }
  .choice.active .choice-lbl { color: var(--gold-l); }

  /* SENTIMENT */
  .sentiments { display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px; }
  .sent-btn {
    padding: 15px 20px; border: 1px solid var(--border);
    background: var(--surf); cursor: pointer;
    font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 300;
    color: var(--muted); transition: all 0.2s ease; text-align: left;
    display: flex; align-items: center; gap: 10px;
  }
  .sent-btn:hover { border-color: rgba(201,168,76,0.5); color: var(--cream); }
  .sent-btn.active { border-color: var(--gold); color: var(--cream); background: var(--surfl); }
  .sent-indicator {
    width: 6px; height: 6px; border-radius: 50%; border: 1px solid var(--border);
    flex-shrink: 0; transition: all 0.2s;
  }
  .sent-btn.active .sent-indicator { background: var(--gold); border-color: var(--gold); }

  /* FOLLOW UP */
  .followup-label {
    font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 8px; display: block; margin-top: 4px;
  }

  /* NAV */
  .q-nav { margin-top: 28px; display: flex; flex-direction: column; gap: 10px; padding-bottom: 48px; }

  /* SUBMITTING STATE */
  .submitting {
    min-height: 100vh; display: flex; flex-direction: column;
    justify-content: center; align-items: center; text-align: center;
    animation: fadeUp 0.5s ease both;
  }
  .spinner {
    width: 48px; height: 48px; border: 1px solid var(--border);
    border-top-color: var(--gold); border-radius: 50%;
    animation: spin 0.9s linear infinite; margin: 0 auto 28px;
  }
  .submitting-text {
    font-family: 'Cormorant Garamond', serif; font-size: 22px;
    color: var(--cream); margin-bottom: 8px;
  }
  .submitting-sub { font-size: 13px; color: var(--muted); }

  /* ERROR STATE */
  .error-box {
    margin-top: 12px; padding: 14px 16px;
    border: 1px solid rgba(220,60,60,0.35);
    background: rgba(220,60,60,0.06);
    font-size: 12px; color: #e08080; line-height: 1.6;
    text-align: center;
  }

  /* THANK YOU */
  .thankyou {
    min-height: 100vh; display: flex; flex-direction: column;
    justify-content: center; align-items: center; text-align: center;
    padding: 48px 0; animation: fadeUp 0.8s ease both;
  }
  .ty-ring {
    width: 72px; height: 72px;
    border: 1px solid var(--gold); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 28px; font-size: 28px;
    animation: pulseRing 2s ease infinite;
  }
  .ty-title {
    font-family: 'Cormorant Garamond', serif; font-size: 42px;
    font-weight: 300; color: var(--cream); margin-bottom: 14px;
  }
  .ty-title em { font-style: italic; color: var(--gold-l); }
  .ty-body { font-size: 13.5px; line-height: 1.85; color: var(--muted); max-width: 290px; }
  .ty-rule {
    width: 1px; height: 52px;
    background: linear-gradient(to bottom, var(--gold), transparent);
    margin: 28px auto 0;
  }
  .ty-tag {
    font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--gold); margin-top: 20px;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulseRing {
    0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
    50%       { box-shadow: 0 0 0 8px rgba(201,168,76,0.12); }
  }
`;

export default function BUCRSurvey() {
  const [screen, setScreen] = useState("intro");
  const [answers, setAnswers] = useState({
    1: { text: "" },
    2: { scale: null, text: "" },
    3: { text: "" },
    4: { choice: null, why: "" },
    5: { sentiment: null, text: "" },
  });
  const [submitError, setSubmitError] = useState(null);
  const topRef = useRef(null);

  const currentQ = screen.startsWith("q") ? parseInt(screen.slice(1)) : null;
  const progress =
    screen === "intro"
      ? 0
      : screen === "submitting"
        ? 95
        : screen === "done"
          ? 100
          : (currentQ / 5) * 100;

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [screen]);

  function upd(qId, patch) {
    setAnswers((prev) => ({ ...prev, [qId]: { ...prev[qId], ...patch } }));
  }

  function canProceed(qId) {
    const a = answers[qId];
    if (qId === 1) return a.text.trim().length > 10;
    if (qId === 2) return a.scale !== null && a.text.trim().length > 5;
    if (qId === 3) return a.text.trim().length > 10;
    if (qId === 4) return a.choice !== null;
    if (qId === 5) return a.sentiment !== null;
    return false;
  }

  async function handleNext() {
    if (currentQ < 5) {
      setScreen(`q${currentQ + 1}`);
    } else {
      await submitAnswers();
    }
  }

  function handlePrev() {
    if (currentQ > 1) setScreen(`q${currentQ - 1}`);
    else setScreen("intro");
  }

  async function submitAnswers() {
    setScreen("submitting");
    setSubmitError(null);

    const payload = {
      q1_booking_frustration: answers[1].text,
      q2_scale: answers[2].scale,
      q2_compelling_feedback: answers[2].text,
      q3_intent_and_barriers: answers[3].text,
      q4_priority_choice: answers[4].choice,
      q4_priority_why: answers[4].why,
      q5_sentiment: answers[5].sentiment,
      q5_sentiment_why: answers[5].text,
    };

    try {
      const res = await fetch(SHEET_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const text = await res.text();

      console.log("RAW RESPONSE:", text);

      const data = JSON.parse(text);
      if (data.success) {
        setScreen("done");
      } else {
        throw new Error(data.error || "Submission failed.");
      }
    } catch (err) {
      setScreen("q5");
      setSubmitError(
        "Something went wrong saving your response. Please try submitting again.",
      );
    }
  }

  const q = currentQ ? questions[currentQ - 1] : null;

  return (
    <>
      <style>{css}</style>

      {/* Progress bar */}
      <div className="prog-wrap">
        <div className="prog-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step dots — only during questions */}
      {currentQ && (
        <div className="step-dots">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`step-dot${n < currentQ ? " done" : n === currentQ ? " active" : ""}`}
            />
          ))}
        </div>
      )}

      <div className="shell" ref={topRef}>
        {/* LOGO */}
        {screen !== "submitting" && (
          <div className="logo-badge">
            <div className="logo-line" />
            <span className="logo-text">BUCR</span>
            <div className="logo-line" />
          </div>
        )}

        {/* ── INTRO ───────────────────────────────────────────────── */}
        {screen === "intro" && (
          <div className="intro">
            <p className="intro-tag">Guest Experience Survey</p>
            <div className="intro-ornament" />
            <h1 className="intro-title">
              Your dining
              <br />
              <em>experience matters.</em>
            </h1>
            <p className="intro-body">
              We're building something to make fine dining reservations
              effortless and rewarding for guests like you. Five honest
              questions — no right answers, no email required.
            </p>
            <div className="intro-cards">
              {[
                ["5", "Questions"],
                ["3′", "Minutes"],
                ["100%", "Anonymous"],
              ].map(([n, l]) => (
                <div key={l} className="intro-card">
                  <span className="intro-card-num">{n}</span>
                  <span className="intro-card-label">{l}</span>
                </div>
              ))}
            </div>
            <div className="intro-divider" />
            <button className="btn" onClick={() => setScreen("q1")}>
              Begin Survey
            </button>
          </div>
        )}

        {/* ── QUESTIONS ────────────────────────────────────────────── */}
        {screen.startsWith("q") && q && (
          <div className="q-screen" key={screen}>
            <div className="q-header">
              <span className="q-tag">{q.tag}</span>
              <span className="q-num">Question {q.id} of 5</span>
              <p className="q-text">{q.question}</p>
              {q.subtext && <p className="q-subtext">{q.subtext}</p>}
            </div>

            {/* TEXTAREA */}
            {q.type === "textarea" && (
              <>
                <textarea
                  value={answers[q.id].text}
                  onChange={(e) => upd(q.id, { text: e.target.value })}
                  placeholder={q.placeholder}
                  maxLength={600}
                />
                <p className="char-count">{answers[q.id].text.length} / 600</p>
              </>
            )}

            {/* SCALE + TEXT */}
            {q.type === "scale_plus_text" && (
              <>
                <div className="scale-wrap">
                  <div className="scale-labels">
                    <span>Not compelling</span>
                    <span>Very compelling</span>
                  </div>
                  <div className="scale-row">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <div
                        key={n}
                        className={`scale-btn${answers[2].scale === n ? " active" : ""}`}
                        onClick={() => upd(2, { scale: n })}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
                <textarea
                  value={answers[2].text}
                  onChange={(e) => upd(2, { text: e.target.value })}
                  placeholder={q.placeholder}
                  maxLength={500}
                />
                <p className="char-count">{answers[2].text.length} / 500</p>
              </>
            )}

            {/* CHOICE */}
            {q.type === "choice" && (
              <>
                <div className="choices">
                  {q.options.map((opt) => (
                    <div
                      key={opt.label}
                      className={`choice${answers[4].choice === opt.label ? " active" : ""}`}
                      onClick={() => upd(4, { choice: opt.label })}
                    >
                      <span className="choice-lbl">{opt.label}</span>
                      <span className="choice-txt">{opt.text}</span>
                    </div>
                  ))}
                </div>
                {answers[4].choice && (
                  <>
                    <span className="followup-label">{q.followUp}</span>
                    <textarea
                      value={answers[4].why}
                      onChange={(e) => upd(4, { why: e.target.value })}
                      placeholder={q.followUpPlaceholder}
                      style={{ minHeight: "96px" }}
                      maxLength={400}
                    />
                    <p className="char-count">{answers[4].why.length} / 400</p>
                  </>
                )}
              </>
            )}

            {/* SENTIMENT + TEXT */}
            {q.type === "sentiment_plus_text" && (
              <>
                <div className="sentiments">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      className={`sent-btn${answers[5].sentiment === opt ? " active" : ""}`}
                      onClick={() => upd(5, { sentiment: opt })}
                    >
                      <span className="sent-indicator" />
                      {opt}
                    </button>
                  ))}
                </div>
                {answers[5].sentiment && (
                  <>
                    <span className="followup-label">Tell us why</span>
                    <textarea
                      value={answers[5].text}
                      onChange={(e) => upd(5, { text: e.target.value })}
                      placeholder={q.placeholder}
                      style={{ minHeight: "96px" }}
                      maxLength={400}
                    />
                    <p className="char-count">{answers[5].text.length} / 400</p>
                  </>
                )}
              </>
            )}

            {submitError && <div className="error-box">{submitError}</div>}

            <div className="q-nav">
              <button
                className="btn"
                onClick={handleNext}
                disabled={!canProceed(currentQ)}
              >
                {currentQ < 5 ? "Next Question" : "Submit My Response"}
              </button>
              <button className="btn-ghost" onClick={handlePrev}>
                ← {currentQ === 1 ? "Back to start" : "Previous question"}
              </button>
            </div>
          </div>
        )}

        {/* ── SUBMITTING ───────────────────────────────────────────── */}
        {screen === "submitting" && (
          <div className="submitting">
            <div className="spinner" />
            <p className="submitting-text">Saving your response…</p>
            <p className="submitting-sub">Just a moment.</p>
          </div>
        )}

        {/* ── THANK YOU ────────────────────────────────────────────── */}
        {screen === "done" && (
          <div className="thankyou">
            <div className="ty-ring">✦</div>
            <h2 className="ty-title">
              Thank <em>you.</em>
            </h2>
            <p className="ty-body">
              Your feedback is genuinely valuable. It directly shapes how we
              build a better dining experience for guests across Nigeria.
            </p>
            <div className="ty-rule" />
            <p className="ty-tag">BUCR — Built for Nigerian Hospitality</p>
          </div>
        )}
      </div>
    </>
  );
}
