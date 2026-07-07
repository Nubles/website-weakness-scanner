import { CheerioCrawler, purgeDefaultStorages } from '@crawlee/cheerio';
import { beforeAll, describe, expect, it } from 'vitest';

import { router } from '../src/routes.js';

describe('Website Weakness Scanner crawler', () => {
    beforeAll(async () => {
        await purgeDefaultStorages();
    });

    it('scans a page and stores website weakness fields', async () => {
        const crawler = new CheerioCrawler({
            maxRequestsPerCrawl: 1,
            requestHandler: router,
        });

        await crawler.run(['https://www.example.com']);

        expect(crawler.stats.state.requestsFinished).toBeGreaterThanOrEqual(1);

        const { items } = await crawler.getData();
        expect(items.length).toBeGreaterThan(0);
        expect(items[0].url).toContain('example.com');
        expect(items[0].businessName).toContain('Example Domain');
        expect(items[0].issues).toContain('No obvious phone number, email, or contact link found');
        expect(items[0].quickPitch).toContain('audit of your website');
    }, 30_000);
});
