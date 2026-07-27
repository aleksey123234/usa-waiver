"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "./analytics";

const questions = [
  {
    key: "canadian",
    question: "Are you a Canadian citizen or resident?",
    options: ["Yes", "No"],
  },
  {
    key: "reason",
    question: "Why might you be inadmissible to the U.S.?",
    options: ["Criminal record", "Previous border denial", "Overstay or removal", "Not sure"],
  },
  {
    key: "timeline",
    question: "When do you hope to travel?",
    options: ["Within 3 months", "3–6 months", "6+ months", "No fixed date"],
  },
] as const;

const process = [
  ["01", "Eligibility review", "We review your history and explain whether an I-192 waiver may be the right path."],
  ["02", "Records and documents", "We help identify the fingerprints, court records, references and supporting evidence your case needs."],
  ["03", "Application preparation", "Your forms, personal statement and supporting package are organized for submission."],
  ["04", "Submission support", "You receive clear instructions for filing and know what to expect after submission."],
];

const faqs = [
  ["What is a U.S. Entry Waiver?", "A U.S. Entry Waiver is advance permission that may allow an otherwise inadmissible nonimmigrant to temporarily enter the United States. Many applications are made using Form I-192."],
  ["Do I need a Canadian record suspension first?", "Not necessarily. A Canadian record suspension and a U.S. Entry Waiver serve different purposes. Your circumstances should be reviewed before choosing a path."],
  ["Can approval be guaranteed?", "No. Approval or denial is decided by U.S. authorities. A reputable preparation service should never guarantee an outcome."],
  ["How long does the process take?", "Timelines vary based on the records required, the complexity of the case and current government processing. Starting early is important."],
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const choose = (value: string) => setAnswer(value);
  const next = () => {
    if (!answer) return;
    const current = questions[step];
    trackEvent("quiz_step", {
      step_number: step + 1,
      question_key: current.key,
      answer,
    });
    setAnswers((previous) => ({ ...previous, [current.key]: answer }));
    setAnswer("");
    setStep((currentStep) => currentStep + 1);
  };

  const scrollToQuiz = (source = "unknown") => {
    trackEvent("quiz_started", { source });
    document.getElementById("eligibility")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");

    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams(window.location.search);
    const attribution = Object.fromEntries(
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
        .map((key) => [key, params.get(key) ?? ""])
        .filter(([, value]) => value),
    );

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          phone: form.get("phone"),
          email: form.get("email"),
          website: form.get("website"),
          answers,
          attribution,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "We could not send your assessment.");
      }

      trackEvent("lead_submitted", {
        lead_type: "eligibility_assessment",
        reason: answers.reason ?? "unknown",
        travel_timeline: answers.timeline ?? "unknown",
      });
      setSubmitted(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="USA Waiver Canada home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>USA <strong>Waiver</strong><small>Canada</small></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#process">How It Works</a>
          <a href="#eligibility">Eligibility</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="header-cta" onClick={() => scrollToQuiz("header")}>Free Assessment</button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">U.S. ENTRY WAIVER HELP FOR CANADIANS</p>
          <h1>Denied entry to the U.S.? Take the first step back across.</h1>
          <p className="hero-sub">
            Clear, confidential support for Canadians preparing a U.S. Entry Waiver application.
          </p>
          <button className="primary-cta" onClick={() => scrollToQuiz("hero")}>
            Check My Eligibility <span>→</span>
          </button>
          <p className="micro-trust"><span>Private</span><b>•</b><span>Clear process</span><b>•</b><span>Human-reviewed</span></p>
        </div>

        <div className="quiz-card" id="eligibility">
          {!submitted ? (
            <>
              <div className="quiz-head">
                <div>
                  <p className="quiz-kicker">FREE INITIAL ASSESSMENT</p>
                  <h2>{step < questions.length ? "Check your situation" : "Where should we send your assessment?"}</h2>
                </div>
                <span>{step + 1} of 4</span>
              </div>
              <div className="progress"><i style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>
              {step < questions.length ? (
                <>
                  <h3>{questions[step].question}</h3>
                  <div className={`answer-grid ${questions[step].options.length > 2 ? "compact" : ""}`}>
                    {questions[step].options.map((option) => (
                      <button
                        key={option}
                        className={answer === option ? "selected" : ""}
                        onClick={() => choose(option)}
                        aria-pressed={answer === option}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <button className="quiz-next" disabled={!answer} onClick={next}>Continue</button>
                </>
              ) : (
                <form
                  className="lead-form"
                  onSubmit={submitLead}
                >
                  <label className="honeypot" aria-hidden="true">
                    Website
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                  <div className="field-row">
                    <label>First name<input name="firstName" required autoComplete="given-name" /></label>
                    <label>Phone<input name="phone" required autoComplete="tel" type="tel" /></label>
                  </div>
                  <label>Email address<input name="email" required autoComplete="email" type="email" /></label>
                  <label className="consent"><input type="checkbox" required /> I agree to be contacted about my assessment.</label>
                  {formError && <p className="form-error" role="alert">{formError}</p>}
                  <button className="quiz-next" type="submit" disabled={submitting}>
                    {submitting ? "Sending…" : "Get My Assessment"}
                  </button>
                </form>
              )}
              <p className="secure">▣ Your information is private and confidential.</p>
            </>
          ) : (
            <div className="success">
              <span>✓</span>
              <h2>Thank you.</h2>
              <p>We received your initial assessment. A specialist will review your answers and contact you.</p>
              <small>Assessment reference: {Object.keys(answers).length + 2407}</small>
            </div>
          )}
        </div>
      </section>

      <section className="proof-strip" aria-label="Service benefits">
        <article><span>2</span><div><strong>2-minute initial check</strong><small>Quick answers to get started.</small></div></article>
        <article><span>⌾</span><div><strong>Clear document roadmap</strong><small>Know what your case may require.</small></div></article>
        <article><span>●</span><div><strong>Every case human-reviewed</strong><small>Real support, not automated advice.</small></div></article>
      </section>

      <section className="intro section">
        <p className="section-label">UNDERSTAND YOUR OPTIONS</p>
        <h2>A previous mistake should not leave you guessing at the border.</h2>
        <p>
          If you have a Canadian criminal record, were refused entry, overstayed, or were removed from the United States,
          you may need advance permission before travelling. We help you understand the process and prepare a complete,
          organized application package.
        </p>
      </section>

      <section className="process section" id="process">
        <div className="section-heading">
          <div><p className="section-label">HOW IT WORKS</p><h2>A clear path from questions to submission.</h2></div>
          <p>No confusing handoffs. You always know what has been completed, what is still needed, and what happens next.</p>
        </div>
        <div className="process-grid">
          {process.map(([number, title, text]) => (
            <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="reasons">
        <div>
          <p className="section-label">COMMON SITUATIONS</p>
          <h2>You may need an entry waiver if you have:</h2>
        </div>
        <ul>
          <li>A Canadian or U.S. criminal conviction</li>
          <li>A previous refusal at a U.S. border</li>
          <li>An immigration overstay or prior removal</li>
          <li>Been told by an officer to apply for a waiver</li>
        </ul>
      </section>

      <section className="pricing" id="pricing">
        <div className="pricing-heading">
          <p className="section-label">CLEAR, UPFRONT PRICING</p>
          <h2>Know the professional fee before you begin.</h2>
          <p>
            No hidden charges for standard application preparation. Government
            fees and third-party document costs are paid separately.
          </p>
        </div>

        <div className="pricing-grid">
          <article className="price-card featured">
            <span className="popular">MOST COMMON</span>
            <p className="plan-name">Standard Application</p>
            <div className="price"><small>CAD</small><strong>$1,495</strong><em>+ tax</em></div>
            <p className="plan-note">For a standard U.S. Entry Waiver application.</p>
            <ul>
              <li>Eligibility and case review</li>
              <li>Personalized document checklist</li>
              <li>Form I-192 preparation</li>
              <li>Personal statement guidance</li>
              <li>Reference letter guidance</li>
              <li>Supporting evidence review</li>
              <li>Final application package review</li>
              <li>Submission instructions</li>
            </ul>
            <button className="price-cta" onClick={() => scrollToQuiz("pricing_standard")}>Start Free Assessment</button>
          </article>

          <article className="price-card">
            <p className="plan-name">Complex Application</p>
            <div className="price"><small>CAD</small><strong>$1,995</strong><em>+ tax</em></div>
            <p className="plan-note">Starting price for cases requiring additional work.</p>
            <ul>
              <li>Everything in Standard</li>
              <li>Multiple jurisdictions or convictions</li>
              <li>Prior removal or deportation</li>
              <li>Overstay or misrepresentation history</li>
              <li>Possible Form I-212 requirements</li>
              <li>Individual quote after assessment</li>
            </ul>
            <button className="price-cta secondary" onClick={() => scrollToQuiz("pricing_complex")}>Assess My Case</button>
          </article>

          <article className="price-card">
            <p className="plan-name">Waiver Renewal</p>
            <div className="price"><small>CAD</small><strong>$995</strong><em>+ tax</em></div>
            <p className="plan-note">When your previous package is available and circumstances have not materially changed.</p>
            <ul>
              <li>Previous application review</li>
              <li>Updated forms and information</li>
              <li>Updated personal statement</li>
              <li>Supporting document review</li>
              <li>Final package review</li>
              <li>Submission instructions</li>
            </ul>
            <button className="price-cta secondary" onClick={() => scrollToQuiz("pricing_renewal")}>Check Renewal</button>
          </article>
        </div>

        <div className="cost-breakdown">
          <div>
            <span>01</span>
            <p><strong>Professional fee</strong>Your selected preparation package, shown above.</p>
          </div>
          <div>
            <span>02</span>
            <p><strong>U.S. government filing fee</strong>USD $1,100, paid separately. Government fees are subject to change.</p>
          </div>
          <div>
            <span>03</span>
            <p><strong>Third-party documents</strong>Fingerprints, police and court records, translations or delivery when required.</p>
          </div>
        </div>

        <div className="payment-plan">
          <div><span>PAYMENT PLAN AVAILABLE</span><strong>CAD $495 to start, then two payments of CAD $500.</strong></div>
          <p>The completed application package is released after the professional fee has been paid in full.</p>
        </div>
      </section>

      <section className="faq section" id="faq">
        <p className="section-label">QUESTIONS, ANSWERED</p>
        <h2>U.S. Entry Waiver FAQ</h2>
        <div className="faq-list">
          {faqs.map(([question, answer]) => (
            <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <p className="section-label">START WITH CLARITY</p>
        <h2>Find out what your next step should be.</h2>
        <p>Answer a few private questions. There is no obligation and no approval guarantee.</p>
        <button className="primary-cta" onClick={() => scrollToQuiz("footer_cta")}>Start Free Assessment <span>→</span></button>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark"><i /><i /><i /><i /></span><span>USA <strong>Waiver</strong><small>Canada</small></span></a>
        <p>Independent application preparation support for Canadians.</p>
        <p className="disclaimer">Not a government agency. Decisions on admissibility and waiver applications are made solely by U.S. authorities. Information on this website is general and is not legal advice.</p>
        <small>© 2026 USA Waiver Canada · Privacy · Terms</small>
      </footer>
    </main>
  );
}
