import app from "./app";
import logger from "./utils/logger";
import {MikroORM} from "@mikro-orm/postgresql";
import config from './mikro-orm.config';
import startWorker from "./worker/worker";
import {startSubscriber} from "./subscribers/authorSubscriber";

const PORT = process.env.PORT || 3000;

(async () => {
    app.locals.orm = await MikroORM.init(config);

    app.listen(PORT, () => logger.info(`Server running on port ${PORT}!`));

    if (process.env.GCLOUD_PROJECT) {
        startWorker().catch(err => {
            logger.error('Worker failed:', err);
            process.exit(1);
        });

        startSubscriber()
            .catch(error => {
                logger.error("Subscriber failed to start", error)
                process.exit(1);
            });
    } else {
        logger.warn("GCLOUD_PROJECT is not set, skipping worker and subscriber.");
    }
})();