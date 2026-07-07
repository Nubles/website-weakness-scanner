# Agency Website Auditor Pro

Agency Website Auditor Pro is a fully automated website auditing engine built for sales representatives, cold outreach specialists, and agency owners. It scans business websites to identify critical vulnerabilities, missing optimization tools, and conversion blockers—then auto-generates a personalized, highly persuasive cold outreach sales pitch.

Instead of sending generic "we build websites" emails, you can provide prospective clients with a precise list of their actual issues (like missing tracking pixels or SEO meta data) and a custom proposal to fix them.

---

## 🚀 Key Audits & Signals Detected

*   **Conversion Pixel Check:** Automatically checks for **Google Tag Manager, Google Analytics, and Meta (Facebook) Pixel** installations. Missing pixels are prime sales opportunities for tracking setup or retargeting services.
*   **Structured Data (Schema.org):** Scans for JSON-LD scripts and schema tags. If missing, pitches local SEO rich-snippet services.
*   **Security Check:** Flags insecure non-HTTPS website connections.
*   **Performance (Speed) Auditor:** Highlights slow homepage loads (takes more than 2.5 seconds).
*   **Basic SEO Auditor:** Analyzes missing viewport tags, short/generic titles, and missing or poorly formatted meta descriptions.
*   **Contact CTA Checker:** Flags missing booking links, telephone numbers, emails, and obvious inquiry forms.
*   **Tech Stack Footprints:** Identifies exposed WordPress generator tags and outdated jQuery libraries.

---

## 📥 Input Settings

| Parameter | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| **Website URLs** (`startUrls`) | Array | List of homepages to audit. | *(Prefilled with Example.com)* |
| **Max Websites** (`maxRequestsPerCrawl`) | Integer | Maximum number of domains to scan per run. | `50` |
| **Request Timeout** (`requestTimeoutSecs`) | Integer | Seconds to wait for slow websites before timing out. | `30` |
| **Use Apify Proxy** (`useProxy`) | Boolean | Enable if scanning targets that block direct crawling. | `false` |

---

## 📤 Output Schema

For every audited website, the Actor returns:

```json
{
  "url": "https://example.com",
  "businessName": "Example Domain",
  "statusCode": 200,
  "loadTimeMs": 280,
  "pageTitle": "Example Domain",
  "metaDescription": "Detailed meta description here...",
  "emails": [],
  "phones": [],
  "contactUrls": [],
  "socialUrls": [],
  "issues": [
    "No obvious phone number, email, or contact link found",
    "Google Analytics or Tag Manager tracking pixel is missing",
    "Facebook/Meta Pixel conversion tracker is missing",
    "Structured data schema markup is missing"
  ],
  "issueCount": 4,
  "severity": "medium",
  "quickPitch": "I did a quick audit of your website and noticed a few marketing and SEO vulnerabilities: it is missing Google Tag/Analytics tracking, meaning you are blind to website traffic and visitor conversions, lacks a Meta Pixel, which prevents you from running retargeting ads to recapture interested leads, lacks Schema structured data, making it harder for Google to display rich snippets and list you high in local search results, and it lacks clear contact options and call-to-action buttons, which hurts your user inquiries and conversion rate. I can help you resolve these quick-wins to improve your local leads.",
  "scannedAt": "2026-07-07T21:55:00.000Z"
}
```

---

## 💡 Commercial Use & Monetization

We recommend listing this Actor on the **Apify Store** using the **Pay-Per-Result (PPR)** or **Pay-Per-Event (PPE)** monetization model:
*   **Suggested Pricing:** **$0.01 per website audited**.
*   **Platform cost:** Very low CPU/RAM overhead, executing in fractions of a second using static Cheerio parsing.

---

## 🛠️ Run Locally or Deploy

### Run Locally
```bash
apify run
```

### Deploy to Apify Console
```bash
apify push
```
