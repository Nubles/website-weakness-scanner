import * as cheerio from 'cheerio';

const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_REGEX = /(?:\+44\s?|0)(?:\d[\s().-]?){9,12}\d/g;
const SOCIAL_HOSTS = ['facebook.com', 'instagram.com', 'linkedin.com', 'x.com', 'twitter.com', 'tiktok.com'];

const clean = (value) => value?.replace(/\s+/g, ' ').trim() ?? '';
const unique = (values) => [...new Set(values.map(clean).filter(Boolean))];

const absoluteUrl = (href, baseUrl) => {
    try {
        return new URL(href, baseUrl).href;
    } catch {
        return null;
    }
};

const buildIssue = (condition, issue, issues) => {
    if (condition) issues.push(issue);
};

const getSeverity = (issueCount) => {
    if (issueCount >= 5) return 'high';
    if (issueCount >= 2) return 'medium';
    return 'low';
};

const makePitch = (issues) => {
    if (!issues.length) {
        return 'Your website appears to have the critical trust, SEO, and tracking foundations set up properly. Excellent job!';
    }

    const pitchParts = [];
    if (issues.includes('Website does not use HTTPS')) {
        pitchParts.push('is currently marked as insecure because it lacks HTTPS');
    }
    if (issues.includes('Google Analytics or Tag Manager tracking pixel is missing')) {
        pitchParts.push(
            'is missing Google Tag/Analytics tracking, meaning you are blind to website traffic and visitor conversions',
        );
    }
    if (issues.includes('Facebook/Meta Pixel conversion tracker is missing')) {
        pitchParts.push(
            'lacks a Meta Pixel, which prevents you from running retargeting ads to recapture interested leads',
        );
    }
    if (issues.includes('Structured data schema markup is missing')) {
        pitchParts.push(
            'lacks Schema structured data, making it harder for Google to display rich snippets and list you high in local search results',
        );
    }
    if (
        issues.includes('No obvious phone number, email, or contact link found') ||
        issues.includes('No clear contact, booking, quote, or enquiry call-to-action found')
    ) {
        pitchParts.push(
            'lacks clear contact options and call-to-action buttons, which hurts your user inquiries and conversion rate',
        );
    }
    if (issues.includes('Meta description is missing') || issues.includes('Page title is too short or generic')) {
        pitchParts.push(
            'has basic SEO setup issues (missing or generic page title/meta descriptions) which hurts organic search click-throughs',
        );
    }
    if (issues.includes('Mobile viewport tag is missing')) {
        pitchParts.push('is missing a mobile viewport tag, making it look broken or hard to use on smartphones');
    }
    if (issues.includes('Homepage loaded slowly')) {
        pitchParts.push('loads slowly, which frustrates visitors and drops your Google Search rankings');
    }

    if (pitchParts.length === 0) {
        const genericIssues = issues.slice(0, 2).map((i) => i.toLowerCase());
        return `I noticed some technical and marketing areas for improvement on your website: it ${genericIssues.join(' and ')}. Fixing these simple things will boost your search visibility and conversion rate.`;
    }

    const introduction = 'I did a quick audit of your website and noticed a few marketing and SEO vulnerabilities: it ';
    if (pitchParts.length === 1) {
        return `${introduction}${pitchParts[0]}. Resolving this can immediately help you attract and convert more local clients.`;
    }
    const firstPart = pitchParts.slice(0, -1).join(', ');
    const lastPart = pitchParts[pitchParts.length - 1];
    return `${introduction}${firstPart}, and it ${lastPart}. I can help you resolve these quick-wins to improve your local leads.`;
};

export const auditWebsite = ({ url, statusCode, loadTimeMs, html }) => {
    const $ = cheerio.load(html ?? '');
    const title = clean($('title').first().text());
    const h1 = clean($('h1').first().text());
    const description = clean($('meta[name="description"]').attr('content'));
    const viewport = clean($('meta[name="viewport"]').attr('content'));
    const generator = clean($('meta[name="generator"]').attr('content'));
    const bodyText = $('body').text();
    const pageText = `${bodyText} ${$('a').text()}`;

    const links = $('a')
        .toArray()
        .map((link) => ({
            text: clean($(link).text()),
            href: clean($(link).attr('href')),
        }));

    const emails = unique([
        ...(pageText.match(EMAIL_REGEX) ?? []),
        ...links
            .filter((link) => link.href.startsWith('mailto:'))
            .map((link) => link.href.replace(/^mailto:/i, '').split('?')[0]),
    ]);
    const phones = unique([
        ...(pageText.match(PHONE_REGEX) ?? []),
        ...links.filter((link) => link.href.startsWith('tel:')).map((link) => link.href.replace(/^tel:/i, '')),
    ]);
    const contactUrls = unique(
        links
            .filter((link) =>
                /contact|booking|appointment|quote|enquiry|get in touch/i.test(`${link.text} ${link.href}`),
            )
            .map((link) => absoluteUrl(link.href, url))
            .filter(Boolean),
    );
    const socialUrls = unique(
        links
            .map((link) => absoluteUrl(link.href, url))
            .filter(Boolean)
            .filter((linkUrl) => SOCIAL_HOSTS.some((host) => linkUrl.includes(host))),
    );

    const hasSchema = $('script[type="application/ld+json"]').length > 0 || $('[itemscope]').length > 0;
    const hasGoogleAnalytics = /googletagmanager\.com|google-analytics\.com|gtag\(/i.test(html);
    const hasMetaPixel = /connect\.facebook\.net\/en_US\/fbevents\.js|fbq\(/i.test(html);

    const hasContactSignal = emails.length > 0 || phones.length > 0 || contactUrls.length > 0;
    const hasCta = /book|booking|appointment|quote|enquiry|get in touch|contact us|call now|request/i.test(pageText);
    const issues = [];

    buildIssue(!url.startsWith('https://'), 'Website does not use HTTPS', issues);
    buildIssue(statusCode >= 400, `Website returned HTTP ${statusCode}`, issues);
    buildIssue(loadTimeMs > 2500, 'Homepage loaded slowly', issues);
    buildIssue(title.length < 10 || /^home$/i.test(title), 'Page title is too short or generic', issues);
    buildIssue(title.length > 65, 'Page title may be too long for search results', issues);
    buildIssue(!description, 'Meta description is missing', issues);
    buildIssue(description.length > 0 && description.length < 70, 'Meta description is too short', issues);
    buildIssue(description.length > 160, 'Meta description may be too long for search results', issues);
    buildIssue(!viewport, 'Mobile viewport tag is missing', issues);
    buildIssue(!hasContactSignal, 'No obvious phone number, email, or contact link found', issues);
    buildIssue(!hasCta, 'No clear contact, booking, quote, or enquiry call-to-action found', issues);
    buildIssue(socialUrls.length === 0, 'No social profile links found', issues);
    buildIssue(!hasGoogleAnalytics, 'Google Analytics or Tag Manager tracking pixel is missing', issues);
    buildIssue(!hasMetaPixel, 'Facebook/Meta Pixel conversion tracker is missing', issues);
    buildIssue(!hasSchema, 'Structured data schema markup is missing', issues);
    buildIssue(/wordpress/i.test(generator), 'WordPress generator tag is exposed', issues);
    buildIssue(/jquery-1\.|jquery-2\./i.test(html), 'Old jQuery version may be in use', issues);

    const issueCount = issues.length;

    return {
        url,
        businessName: h1 || title || new URL(url).hostname,
        statusCode,
        loadTimeMs,
        pageTitle: title,
        metaDescription: description,
        emails,
        phones,
        contactUrls,
        socialUrls,
        issues,
        issueCount,
        severity: getSeverity(issueCount),
        quickPitch: makePitch(issues),
        scannedAt: new Date().toISOString(),
    };
};
