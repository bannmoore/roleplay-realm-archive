import Alert from "@/app/components/Alert";
import database from "@/clients/database";
import Link from "next/link";
import SyncAllImagesButton from "./SyncAllImagesButton";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const channelId = (await params).id;
  const attachments = await database.getChannelAttachments(channelId);

  return (
    <>
      <div className="flex items-center justify-between my-4">
        <div className="flex items-center gap-2">
          <h1>Manage Images</h1>
          <Link href={`/channels/${channelId}`} className="link">
            Back
          </Link>
        </div>
        <SyncAllImagesButton channelId={channelId} />
      </div>

      <div className="my-4">
        <Alert />
      </div>

      <div>
        <table className="w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                Id
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                Migrated to Storage
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                Link
              </th>
              {/* <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {attachments.map((attachment) => (
              <tr key={attachment.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 text-center text-sm text-gray-300">
                  {attachment.id}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-300">
                  {attachment.storagePath ? "Yes" : "No"}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-300">
                  <a
                    href={attachment.storagePath}
                    target="_blank"
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    View
                  </a>
                </td>
                {/* <td className="px-6 py-4 text-center text-sm text-gray-300">
                  {!attachment.sourceUri ? (
                    <SyncImageButton
                      attachmentId={attachment.id}
                      onClickAction={syncImage}
                    />
                  ) : null}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
