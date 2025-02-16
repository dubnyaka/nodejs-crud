import { PubSub } from '@google-cloud/pubsub';
import db from "../db";

const pubsub = new PubSub({ projectId: process.env.GCLOUD_PROJECT });
const topicName = String(process.env.PUBSUB_TOPIC);

export async function processOutboxMessages() {
    // Receive events with the status 'PENDING'
    const messages = await db('outbox').where('status', 'PENDING');

    for (const message of messages) {
        try {
            await pubsub.topic(topicName).publish(
                Buffer.from(message.payload),
                {
                    eventType: message.event_type,
                    outboxId: String(message.id)
                }
            );
            await db('outbox')
                .where('id', message.id)
                .update({ status: 'SENT', sent_at: db.fn.now() });
            console.log(`Outbox message with id: ${message.id} processed.`);
        } catch (error) {
            console.error(`Failed to process outbox message ${message.id}:`, error);
        }
    }
}