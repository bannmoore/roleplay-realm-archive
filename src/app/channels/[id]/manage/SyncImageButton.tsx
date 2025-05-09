"use client";

export default function SyncImageButton({
  attachmentId,
  onClickAction,
}: {
  attachmentId: string;
  onClickAction: (attachmentId: string) => Promise<void>;
}) {
  const handleClick = async () => {
    await onClickAction(attachmentId);
  };

  return (
    <button type="button" onClick={handleClick}>
      Sync Image
    </button>
  );
}
