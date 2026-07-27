import { NextResponse } from "next/server";

type LeadPayload = {
  firstName?: string;
  phone?: string;
  email?: string;
  website?: string;
  answers?: Record<string, string>;
  attribution?: Record<string, string>;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LeadPayload;

    if (payload.website) {
      return NextResponse.json({ ok: true });
    }

    const firstName = payload.firstName?.trim() ?? "";
    const phone = payload.phone?.trim() ?? "";
    const email = payload.email?.trim().toLowerCase() ?? "";

    if (
      firstName.length < 2 ||
      phone.length < 6 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { ok: false, error: "Please check your contact details." },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.LEAD_TO_EMAIL ?? "income@usa-waiver.ca";
    const from =
      process.env.LEAD_FROM_EMAIL ?? "USA Waiver Canada <leads@usa-waiver.ca>";

    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { ok: false, error: "Email delivery is not configured." },
        { status: 503 },
      );
    }

    const answers = payload.answers ?? {};
    const attribution = payload.attribution ?? {};
    const rows = [
      ["Name", firstName],
      ["Phone", phone],
      ["Email", email],
      ["Canadian citizen/resident", answers.canadian ?? "Not provided"],
      ["Reason", answers.reason ?? "Not provided"],
      ["Travel timeline", answers.timeline ?? "Not provided"],
      ["UTM source", attribution.utm_source ?? "Direct / unknown"],
      ["UTM medium", attribution.utm_medium ?? "Not provided"],
      ["UTM campaign", attribution.utm_campaign ?? "Not provided"],
    ];

    const htmlRows = rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;color:#64748b">${escapeHtml(label)}</td><td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#0f172a">${escapeHtml(value)}</td></tr>`,
      )
      .join("");

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New USA Waiver lead — ${firstName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto">
            <h1 style="font-size:24px;color:#081f3d">New eligibility assessment</h1>
            <table style="width:100%;border-collapse:collapse">${htmlRows}</table>
            <p style="margin-top:24px;color:#64748b;font-size:12px">Submitted from usa-waiver.ca</p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Resend rejected lead email", await resendResponse.text());
      return NextResponse.json(
        { ok: false, error: "We could not send your assessment." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lead submission failed", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
