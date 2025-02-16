import { PubSub, Message } from '@google-cloud/pubsub';
import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config';
import log from '../utils/logger';
import { ProcessedMessage } from '../entities/processedMessage.entity';

export async function startSubscriber() {
    // Initialize MikroORM
    const orm = await MikroORM.init(config);
    const em = orm.em.fork();

    // Configure Pub/Sub
    const pubsub = new PubSub({ projectId: process.env.GCLOUD_PROJECT });
    const subscriptionName = String(process.env.PUBSUB_SUBSCRIPTION);
    const subscription = pubsub.subscription(subscriptionName);

    log.info(`Pub/Sub Subscriber started! Listening on subscription: ${subscriptionName}`);

    subscription.on('message', async (message: Message) => {
        const msgId = message.id;
        try {
            const exists = await em.findOne(ProcessedMessage, { messageId: msgId });
            if (exists) {
                log.warn(`Message ${msgId} already processed.`);
                message.ack();
                return;
            }
            const data = JSON.parse(message.data.toString());
            log.info(`Processing AUTHOR_CREATED event for authorId: ${data.authorId}`);
            log.info(`Action executed for author with id: ${data.authorId}.`);

            const processedMsg = em.create(ProcessedMessage, {
                messageId: msgId,
                processedAt: new Date(),
            });
            await em.persistAndFlush(processedMsg);

            message.ack();
        } catch (error) {
            log.error('Error processing message:', error);
        }
    });

    subscription.on('error', error => {
        log.error('Subscription error:', error);
    });

    return subscription;
}
