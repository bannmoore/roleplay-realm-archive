import { faker } from "@faker-js/faker";

import { DiscordMessage, DiscordUser } from "@/clients/discord-types";
import { generateFake } from "../fakes";

export function snowflake() {
  return faker.string.numeric({ length: 18 });
}

export function fakeDiscordUser() {
  return generateFake<DiscordUser>("DiscordUser", {
    id: snowflake(),
    username: faker.internet.username(),
    avatar: undefined,
    global_name: faker.internet.username(),
    bot: false,
  });
}

export function fakeDiscordMessage(obj: Partial<DiscordMessage>) {
  return generateFake<DiscordMessage>("DiscordMessage", {
    id: snowflake(),
    channel_id: snowflake(),
    author: fakeDiscordUser(),
    content: faker.lorem.paragraphs(2),
    timestamp: faker.date.past().toString(),
    attachments: [],
    ...obj,
  });
}
