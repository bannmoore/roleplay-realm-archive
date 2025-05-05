import { faker } from "@faker-js/faker";
import { generateFake } from "../fakes";
import { fakeDiscordSnowflake } from "./discord";
import { Channel, Message } from "@/clients/database";
import { User } from "@/clients/database";
import { DiscordUser } from "@/clients/discord";

function fakeId() {
  return faker.number.int().toString();
}

export function fakeUser() {
  return generateFake<User>("User", {
    discordId: fakeDiscordSnowflake(),
    id: fakeId(),
    discordUsername: faker.internet.username(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  });
}

export function fakeUserFromDiscordUser(discordUser: DiscordUser) {
  return generateFake<User>("User", {
    discordId: discordUser.id,
    id: fakeId(),
    discordUsername: discordUser.username,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  });
}

export function fakeMessage(data: Partial<Message>) {
  return generateFake<Message>("Message", {
    id: fakeId(),
    discordId: fakeDiscordSnowflake(),
    discordPublishedAt: faker.date.past(),
    content: faker.lorem.paragraphs(2),
    authorId: fakeId(),
    channelId: fakeId(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    isThread: false,
    threadId: null,
    ...data,
  });
}

export function fakeChannel(data?: Partial<Channel>) {
  return generateFake<Channel>("Channel", {
    id: fakeId(),
    discordId: fakeDiscordSnowflake(),
    serverId: fakeId(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    active: true,
    lastSyncedAt: null,
    name: faker.lorem.word(),
    ...data,
  });
}
