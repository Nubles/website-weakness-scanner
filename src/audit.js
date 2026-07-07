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
        return 'Your website has the main trust and conversion basics in place. A deeper review could look for speed, SEO, and conversion improvements.';
    }

    const highlighted = issues.slice(0, 3).map((issue) => issue.charAt(0).toLowerCase() + issue.slice(1));
    return `Your website ${highlighted.join(', ')}. Fixing these basics can make it easier for visitors to trust you, contact you, and click through from search results.`;
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
