# USA Waiver Canada

SEO landing page and eligibility quiz for Canadian U.S. Entry Waiver leads.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Google Analytics 4 with Consent Mode
- Resend email delivery
- Vercel hosting

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

```text
RESEND_API_KEY=
LEAD_TO_EMAIL=income@usa-waiver.ca
LEAD_FROM_EMAIL=USA Waiver Canada <leads@usa-waiver.ca>
```

Add the same values in Vercel under Project Settings → Environment Variables.

## Lead delivery

The quiz posts to `POST /api/lead`. The server validates the contact details,
rejects honeypot submissions and sends the complete assessment to the configured
recipient through Resend.

Before production:

1. Verify `usa-waiver.ca` in Resend.
2. Add the required SPF and DKIM records in GoDaddy.
3. Create a Resend API key.
4. Add the environment variables in Vercel.

## Analytics

GA4 property: `G-9FSDPWJ5XC`

Tracked events:

- `quiz_started`
- `quiz_step`
- `lead_submitted`
- `cookie_consent_update`

## Deploy

Import the GitHub repository into Vercel. Framework detection should select
Next.js automatically. No custom build command or output directory is required.
