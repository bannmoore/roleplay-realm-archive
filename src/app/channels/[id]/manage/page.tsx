import Alert from "@/app/components/Alert";
import database from "@/clients/database";
import Link from "next/link";
import ResyncMessagesButton from "./ResyncMessagesButton";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const channelId = (await params).id;
  const channel = await database.getChannel(channelId);

  if (!channel) {
    return notFound();
  }

  const unsyncedMessages = await database.getUnsyncedMessages(channelId);

  return (
    <>
      <div className="flex items-center justify-between my-4">
        <div className="flex items-center gap-2">
          <h1>Manage Channel: {channel.name}</h1>
          <Link href={`/channels/${channelId}`} className="link">
            Back
          </Link>
        </div>
        <ResyncMessagesButton channelId={channelId} />
      </div>

      <div className="my-4">
        <Alert />
      </div>

      <h2>Unsynced Messages</h2>

      <div>
        <table className="w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                Id
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                Created at
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {unsyncedMessages.map((message) => (
              <tr key={message.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-center text-sm text-gray-300">
                  {message.id}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-300">
                  {message.createdAt.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
