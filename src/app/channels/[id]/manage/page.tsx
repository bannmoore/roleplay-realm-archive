import database from "@/clients/database";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const channelId = (await params).id;
  const attachments = await database.getChannelAttachments(channelId);

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <h1>Images</h1>
        <Link href={`/channels/${channelId}`} className="link">
          Back
        </Link>
      </div>
      <div>
        <table className="w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Id
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Migrated to Storage
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {attachments.map((attachment) => (
              <tr key={attachment.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-center text-sm text-gray-300">
                  {attachment.id}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-300">
                  {attachment.sourceUri ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-300">
                  <a
                    href={attachment.sourceUri ?? attachment.discordSourceUri}
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
