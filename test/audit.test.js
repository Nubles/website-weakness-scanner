import { describe, expect, it } from 'vitest';

import { auditWebsite } from '../src/audit.js';

describe('auditWebsite', () => {
    it('flags missing sales basics and creates an outreach pitch', () => {
        const result = auditWebsite({
            url: 'http://example-business.test',
            statusCode: 200,
            loadTimeMs: 3200,
            html: '<html><head><title>Home</title></head><body><h1>Example Business</h1></body></html>',
        });

        expect(result.businessName).toBe('Example Business');
        expect(result.issues).toEqual(
            expect.arrayContaining([
                'Website does not use HTTPS',
                'Page title is too short or generic',
                'Meta description is missing',
                'Mobile viewport tag is missing',
                'No obvious phone number, email, or contact link found',
                'No clear contact, booking, quote, or enquiry call-to-action found',
            ]),
        );
        expect(result.severity).toBe('high');
        expect(result.quickPitch).toContain('does not use HTTPS');
    });

    it('keeps strong pages low severity and extracts contact signals', () => {
        const result = auditWebsite({
            url: 'https://strong-business.test',
            statusCode: 200,
            loadTimeMs: 800,
            html: `
                <html>
                    <head>
                        <title>Manchester Dental Studio | Private Dentist</title>
                        <meta name="description" content="Book modern private dental care in Manchester with transparent pricing and friendly clinicians.">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                    </head>
                    <body>
                        <h1>Manchester Dental Studio</h1>
                        <a href="mailto:hello@example.com">Email us</a>
                        <a href="tel:+441612345678">Call</a>
                        <a href="/contact">Book an appointment</a>
                        <a href="https://www.instagram.com/example">Instagram</a>
                    </body>
                </html>`,
        });

        expect(result.issueCount).toBe(0);
        expect(result.severity).toBe('low');
        expect(result.emails).toEqual(['hello@example.com']);
        expect(result.phones).toEqual(['+441612345678']);
        expect(result.contactUrls).toEqual(['https://strong-business.test/contact']);
        expect(result.socialUrls).toEqual(['https://www.instagram.com/example']);
    });
});
