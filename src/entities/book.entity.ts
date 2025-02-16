import {Entity, PrimaryKey, Property, ManyToOne, Index} from '@mikro-orm/core';
import {Author} from './author.entity';

@Entity()
@Index({properties: ['author']})
@Index({properties: ['genre']})
@Index({properties: ['year']})
export class Book {
    @PrimaryKey()
    id!: number;

    @Property()
    title!: string;

    @Property()
    genre!: string;

    @Property({nullable: true, columnType: 'text'})
    description?: string;

    @Property()
    pages!: number;

    @Property()
    year!: number;

    @ManyToOne(() => Author, { inversedBy: 'books', deleteRule: 'cascade' })
    author!: Author;
}
