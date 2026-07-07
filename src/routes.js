import { createCheerioRouter } from '@crawlee/cheerio';

import { auditWebsite } from './audit.js';

export const router = createCheerioRouter();

router.addDefaultHandler(async ({ request, response, body, log, pushData }) => {
    const loadedUrl = request.loadedUrl ?? request.url;
    const loadTimeMs = request.userData.startedAt ? Date.now() - request.userData.startedAt : null;

    const result = auditWebsite({
        url: loadedUrl,
        statusCode: response?.statusCode ?? 0,
        loadTimeMs,
        html: body?.toString() ?? '',
    });

    await pushData(result);
    log.info(`Scanned ${result.severity} severity website`, {
        url: loadedUrl,
        issueCount: result.issueCount,
    });
});
