import { faker } from "@faker-js/faker";
import { generateFake } from "../fakes";
import { snowflake } from "./discord";
import { User } from "@/dtos/user";
import { Message } from "@/dtos/message";

export function id() {
  return faker.number.int().toString();
}

export function fakeUser() {
  return generateFake<User>("User", {
    discordId: snowflake(),
    id: id(),
    discordUsername: faker.internet.username(),
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
  });
}
