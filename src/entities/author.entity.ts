import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { Book } from './book.entity';

@Entity()
export class Author {
    @PrimaryKey()
    id!: number;

    @Property({ unique: true })
    name!: string;

    @OneToMany({ mappedBy: 'author' })
    books = new Collection<Book>(this);
}