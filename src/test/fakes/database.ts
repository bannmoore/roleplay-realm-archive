import { faker } from "@faker-js/faker";
import { generateFake } from "../fakes";
import { snowflake } from "./discord";
import { Message } from "@/clients/database";
import { User } from "@/clients/database";

export function id() {
  return faker.number.int().toString();
}

export function fakeUser() {
  return generateFake<User>("User", {
    discordId: snowflake(),
    id: id(),
    discordUsername: faker.internet.username(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  });
}

export function fakeMessage() {
  return generateFake<Message>("Message", {
    id: id(),
    discordId: snowflake(),
    discordPublishedAt: faker.date.past(),
    content: faker.lorem.paragraphs(2),
    authorId: id(),
    channelId: id(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  });
}
