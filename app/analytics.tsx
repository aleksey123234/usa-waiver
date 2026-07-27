"use client";

import { useEffect, useState } from "react";

const GA_ID = "G-9FSDPWJ5XC";
const CONSENT_KEY = "usa-waiver-cookie-consent";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function Analytics() {
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = gtag;

    gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      functionality_storage: "granted",
      security_storage: "granted",
      wait_for_update: 500,
    });

    gtag("js", new Date());
    gtag("config", GA_ID, {
      anonymize_ip: true,
      send_page_view: true,
    });

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    const savedChoice = window.localStorage.getItem(CONSENT_KEY);
    if (savedChoice === "accepted") {
      grantConsent();
    }
    setChoice(savedChoice);

    return () => {
      script.remove();
    };
  }, []);

  const grantConsent = () => {
    gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  };

  const accept = () => {
    window.localStorage.setItem(CONSENT_KEY, "accepted");
    grantConsent();
    gtag("event", "cookie_consent_update", { consent_choice: "accepted" });
    setChoice("accepted");
  };

  const decline = () => {
    window.localStorage.setItem(CONSENT_KEY, "declined");
    gtag("event", "cookie_consent_update", { consent_choice: "declined" });
    setChoice("declined");
  };

  if (choice !== null) return null;

  return (
    <aside className="cookie-banner" aria-label="Cookie preferences">
      <div>
        <strong>Your privacy choices</strong>
        <p>
          We use analytics and advertising cookies to understand site use and
          improve our campaigns. You can accept or decline optional cookies.
        </p>
      </div>
      <div className="cookie-actions">
        <button className="cookie-decline" onClick={decline}>Decline</button>
        <button className="cookie-accept" onClick={accept}>Accept</button>
      </div>
    </aside>
  );
}

export function trackEvent(name: string, parameters?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", name, parameters ?? {});
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["event", name, parameters ?? {}]);
}
