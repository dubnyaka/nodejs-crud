import {processOutboxMessages} from "./outboxProcessor";
import logger from "../utils/logger";

async function startWorker() {
    logger.info('Outbox processor started.');
    setInterval(async () => {
        await processOutboxMessages();
    }, 5000);
}

export default startWorker;
