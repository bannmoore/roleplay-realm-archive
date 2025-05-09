"use client";
import * as React from "react";

type loadMoreAction = (
  channelId: string,
  options: { limit: number; offset: number }
) => Promise<readonly [React.JSX.Element, number | null]>;

const LoadMore = ({
  children,
  channelId,
  initialOffset,
  limit,
  loadMoreAction,
}: React.PropsWithChildren<{
  channelId: string;
  initialOffset: number;
  limit: number;
  loadMoreAction: loadMoreAction;
}>) => {
  const [loadMoreNodes, setLoadMoreNodes] = React.useState<React.JSX.Element[]>(
    []
  );

  const [disabled, setDisabled] = React.useState(false);
  const currentOffsetRef = React.useRef<number | string | undefined>(
    initialOffset
  );
  const [loading, setLoading] = React.useState(false);

  const loadMore = React.useCallback(async () => {
    setLoading(true);

    loadMoreAction(channelId, {
      limit: limit,
      offset: Number(currentOffsetRef.current),
    })
      .then(([node, next]) => {
        setLoadMoreNodes((prev) => [node, ...prev]);
        if (next === null) {
          currentOffsetRef.current ??= undefined;
          setDisabled(true);
          return;
        }

        currentOffsetRef.current = next;
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [channelId, limit, loadMoreAction]);

  return (
    <>
      <div className="flex justify-center">
        <button type="button" onClick={loadMore} disabled={disabled || loading}>
          Load More
        </button>
      </div>
      <div className="mt-4">
        {loadMoreNodes}
        {children}
      </div>
    </>
  );
};

export default LoadMore;
