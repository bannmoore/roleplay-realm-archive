import { faker } from "@faker-js/faker";

import { DiscordMessage, DiscordUser } from "@/clients/discord";
import { generateFake } from "../fakes";
import { User } from "@/clients/database";

export function fakeSnowflake() {
  return faker.string.numeric({ length: 18 });
}

export function fakeDiscordUser() {
  return generateFake<DiscordUser>("DiscordUser", {
    id: fakeSnowflake(),
    username: faker.internet.username(),
    avatar: undefined,
    global_name: faker.internet.username(),
    bot: false,
  });
}

export function fakeDiscordUserFromDbUser(user: User) {
  return generateFake<DiscordUser>("DiscordUser", {
    id: user.discordId,
    username: user.discordUsername,
    avatar: undefined,
    global_name: user.discordUsername,
    bot: false,
  });
}

export function fakeDiscordMessage(obj: Partial<DiscordMessage>) {
  return generateFake<DiscordMessage>("DiscordMessage", {
    id: fakeSnowflake(),
    channel_id: fakeSnowflake(),
    author: fakeDiscordUser(),
    content: faker.lorem.paragraphs(2),
    timestamp: faker.date.past().toString(),
    attachments: [],
    ...obj,
  });
}
