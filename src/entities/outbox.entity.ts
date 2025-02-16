import {Entity, Index, PrimaryKey, Property} from '@mikro-orm/core';

@Entity()
@Index({properties: ['status']})
@Index({properties: ['createdAt']})
export class Outbox {
    @PrimaryKey()
    id!: number;

    @Property({fieldName: 'event_type'})
    eventType!: string;

    @Property({columnType: 'text'})
    payload!: string;

    @Property({default: 'PENDING'})
    status!: string;

    @Property({type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP', fieldName: 'created_at'})
    createdAt!: Date;

    @Property({type: 'timestamp', nullable: true, fieldName: 'sent_at'})
    sentAt?: Date;
}
