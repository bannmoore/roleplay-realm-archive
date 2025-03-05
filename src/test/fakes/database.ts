import { faker } from "@faker-js/faker";
import { generateFake } from "../fakes";
import { Selectable } from "kysely";
import { Users, Messages } from "kysely-codegen";
import { snowflake } from "./discord";

export function id() {
  return faker.number.int().toString();
}

export function fakeUser() {
  return generateFake<Selectable<Users>>("User", {
    created_at: faker.date.past(),
    discord_id: snowflake(),
    id: id(),
    updated_at: faker.date.past(),
    discord_username: faker.internet.username(),
  });
}

export function fakeMessage() {
  return generateFake<Selectable<Messages>>("Message", {
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    id: id(),
    discord_id: snowflake(),
    discord_published_at: faker.date.past(),
    content: faker.lorem.paragraphs(2),
    author_id: id(),
    channel_id: id(),
  });
}
