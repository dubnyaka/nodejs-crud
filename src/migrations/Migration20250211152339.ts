import { Migration } from '@mikro-orm/migrations';

export class Migration20250211152339 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "author" ("id" serial primary key, "name" varchar(255) not null);`);
    this.addSql(`alter table "author" add constraint "author_name_unique" unique ("name");`);

    this.addSql(`create table "book" ("id" serial primary key, "title" varchar(255) not null, "genre" varchar(255) not null, "description" text null, "pages" int not null, "year" int not null, "author_id" int not null);`);
    this.addSql(`create index "book_year_index" on "book" ("year");`);
    this.addSql(`create index "book_genre_index" on "book" ("genre");`);
    this.addSql(`create index "book_author_id_index" on "book" ("author_id");`);

    this.addSql(`create table "outbox" ("id" serial primary key, "event_type" varchar(255) not null, "payload" text not null, "status" varchar(255) not null default 'PENDING', "created_at" timestamptz not null default CURRENT_TIMESTAMP, "sent_at" timestamptz null);`);
    this.addSql(`create index "outbox_created_at_index" on "outbox" ("created_at");`);
    this.addSql(`create index "outbox_status_index" on "outbox" ("status");`);

    this.addSql(`create table "processed_message" ("message_id" varchar not null, "processed_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "processed_message_pkey" primary key ("message_id"));`);

    this.addSql(`alter table "book" add constraint "book_author_id_foreign" foreign key ("author_id") references "author" ("id") on update cascade on delete cascade;`);
  }

}
