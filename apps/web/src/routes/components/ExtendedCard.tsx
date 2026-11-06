import { applyConstants } from "@tagapp/utils";
import type { ContentWebType } from "@tagapp/utils/types";
import { memo, useMemo } from "react";
import ContentCard from "@/components/craft/library/ContentCard";
import { useRemoteContext } from "../Remote.Context";

const ExtendedCard = memo(
  ({ contentDetails }: { contentDetails: ContentWebType }) => {
    const { constants } = useRemoteContext();

    const memoisedUrls = useMemo(() => {
      return {
        url: applyConstants(contentDetails.url, constants),
        cover: contentDetails.cover
          ? applyConstants(contentDetails.cover, constants)
          : "",
      };
    }, [contentDetails.url, contentDetails.cover, constants]);

    return (
      <ContentCard
        content={contentDetails}
        url={memoisedUrls.url}
        cover={memoisedUrls.cover}
      />
    );
  },
);

ExtendedCard.displayName = "ExtendedCard";
export default ExtendedCard;
