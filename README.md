# Website Weakness Scanner

This Apify Actor scans business websites for sales-ready weakness signals that agencies can use in outreach.

It checks each supplied website for:

- Missing HTTPS
- HTTP error status
- Slow homepage response
- Missing, short, generic, or long page title
- Missing, short, or long meta description
- Missing mobile viewport tag
- Missing obvious phone, email, or contact link
- Missing contact, booking, quote, or enquiry call-to-action
- Missing social profile links
- Exposed WordPress generator tag
- Old jQuery version hints

Each dataset row includes:

- `url`
- `businessName`
- `statusCode`
- `loadTimeMs` (null when direct timing is unavailable)
- `pageTitle`
- `metaDescription`
- `emails`
- `phones`
- `contactUrls`
- `socialUrls`
- `issues`
- `issueCount`
- `severity`
- `quickPitch`
- `scannedAt`

## Commercial use

Use this after collecting business websites from directories, Google Maps exports, or lead lists. The output gives an agency a specific reason to contact each business, instead of sending generic cold outreach.

Example offer:

> I found 50 local dentists whose websites have fixable trust, SEO, or enquiry issues. Here are the exact problems and suggested outreach angles.

## Run locally

```bash
apify run
```

## Deploy

This project is intended to be linked from GitHub into Apify Console and built there.
