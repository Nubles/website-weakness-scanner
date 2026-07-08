import { createCheerioRouter } from '@crawlee/cheerio';
import { Actor } from 'apify';

import { auditWebsite } from './audit.js';

export const router = ({ enableCharging = false } = {}) => {
    const crawlerRouter = createCheerioRouter();

    crawlerRouter.addDefaultHandler(async ({ request, response, body, log, pushData }) => {
        const loadedUrl = request.loadedUrl ?? request.url;
        const loadTimeMs = request.userData.startedAt ? Date.now() - request.userData.startedAt : null;

        const result = auditWebsite({
            url: loadedUrl,
            statusCode: response?.statusCode ?? 0,
            loadTimeMs,
            html: body?.toString() ?? '',
        });

        await pushData(result);

        if (enableCharging) {
            try {
                await Actor.charge({ eventName: 'website-audited', count: 1 });
            } catch (error) {
                log.warning('Charging skipped for website-audited event', { error: error.message });
            }
        }

        log.info(`Scanned ${result.severity} severity website`, {
            url: loadedUrl,
            issueCount: result.issueCount,
        });
    });

    return crawlerRouter;
};
