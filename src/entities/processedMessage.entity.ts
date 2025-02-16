import {Entity, PrimaryKey, Property} from '@mikro-orm/core';

@Entity()
export class ProcessedMessage {
    @PrimaryKey({columnType: 'varchar'})
    messageId!: string;

    @Property({type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'processed_at'})
    processedAt!: Date;
}
