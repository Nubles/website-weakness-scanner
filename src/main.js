import { CheerioCrawler } from '@crawlee/cheerio';
import { Actor } from 'apify';

import { router } from './routes.js';

await Actor.init();

const {
    startUrls = [{ url: 'https://example.com' }],
    maxRequestsPerCrawl = 50,
    useProxy = false,
    requestTimeoutSecs = 30,
    enableCharging = false,
} = (await Actor.getInput()) ?? {};

const proxyConfiguration = useProxy ? await Actor.createProxyConfiguration() : undefined;

const crawler = new CheerioCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl,
    requestHandlerTimeoutSecs: requestTimeoutSecs,
    requestHandler: router({ enableCharging }),
});

await crawler.run(startUrls);

await Actor.exit();
