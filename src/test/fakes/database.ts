import { faker } from "@faker-js/faker";
import { generateFake } from "../fakes";
import { fakeSnowflake } from "./discord";
import { Channel, Message } from "@/clients/database";
import { User } from "@/clients/database";

function fakeId() {
  return faker.number.int().toString();
}

export function fakeUser() {
  return generateFake<User>("User", {
    discordId: fakeSnowflake(),
    id: fakeId(),
    discordUsername: faker.internet.username(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  });
}

export function fakeMessage(data: Partial<Message>) {
  return generateFake<Message>("Message", {
    id: fakeId(),
    discordId: fakeSnowflake(),
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

export function fakeChannel() {
  return generateFake<Channel>("Channel", {
    id: fakeId(),
    discordId: fakeSnowflake(),
    serverId: fakeId(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    active: true,
    lastSyncedAt: null,
    name: faker.lorem.word(),
  });
}
