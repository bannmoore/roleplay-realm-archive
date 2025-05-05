import { faker } from "@faker-js/faker";

import type {
  DiscordChannel,
  DiscordMessage,
  DiscordMessageAttachment,
  DiscordUser,
} from "@/clients/discord";
import { generateFake } from "../fakes";

export function fakeDiscordSnowflake() {
  return faker.string.numeric({ length: 18 });
}

export function fakeDiscordUser() {
  return generateFake<DiscordUser>("DiscordUser", {
    id: fakeDiscordSnowflake(),
    username: faker.internet.username(),
    avatar: undefined,
    global_name: faker.internet.username(),
    bot: false,
  });
}

export function fakeDiscordChannel() {
  return generateFake<DiscordChannel>("DiscordChannel", {
    id: fakeDiscordSnowflake(),
    guild_id: fakeDiscordSnowflake(),
    name: faker.lorem.word(),
    parent_id: null,
  });
}

export function fakeDiscordMessage(obj: Partial<DiscordMessage>) {
  return generateFake<DiscordMessage>("DiscordMessage", {
    id: fakeDiscordSnowflake(),
    channel_id: fakeDiscordSnowflake(),
    author: fakeDiscordUser(),
    content: faker.lorem.paragraphs(2),
    timestamp: faker.date.past().toString(),
    attachments: [],
    ...obj,
  });
}

export function fakeDiscordMessageAttachment() {
  return generateFake<DiscordMessageAttachment>("DiscordMessageAttachment", {
    id: fakeDiscordSnowflake(),
    filename: faker.system.fileName(),
    url: faker.image.url(),
    size: 1024,
    width: 800,
    height: 600,
    content_type: "image/png",
  });
}
