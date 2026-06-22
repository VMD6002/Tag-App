import TitleHeader from "@/components/craft/TitleHeader";
import Filters from "./components/Filters";
import ServerAffix from "./components/ServerAffix";
import ExtendedCard from "./components/ExtendedCard";
import UpdateModal from "@/components/craft/UpdateModal";
import BulkUpdateModal from "@/components/craft/BulkUpdateModal";
import { useSetAtom, useAtomValue } from "jotai";
import { filterDataAtom, filteredAtom } from "./atom";
import {
  bulkUpdateContentFuncAtom,
  contentDataAtom,
  updateContentFuncAtom,
} from "@/entrypoints/main/atoms/contentData";
import {
  initializeFilterDataFromURLAtom,
  resetFilterAtom,
} from "@/entrypoints/main/atoms/filter";
import { selectionEntriesAtom } from "../../atoms/selection";
import { supportedSitesAtom } from "../../atoms/supportedSites";

export default function Library() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updateContentFunc = useSetAtom(updateContentFuncAtom);
  const bulkUpdateContentFunc = useSetAtom(bulkUpdateContentFuncAtom);

  const filtered = useAtomValue(filteredAtom);
  const filterData = useSetAtom(filterDataAtom);
  const initializeFilterDataFromURL = useSetAtom(
    initializeFilterDataFromURLAtom,
  );
  const reset = useSetAtom(resetFilterAtom);

  const selectedEntries = useAtomValue(selectionEntriesAtom);
  const isSelected = useCallback(
    (id: string) => selectedEntries.includes(id),
    [selectedEntries],
  );

  const contentData = useAtomValue(contentDataAtom);
  const supportedSitesData = useAtomValue(supportedSitesAtom);
  const getContentAndSiteDataByID = useCallback(
    (id: string) => ({
      contentDetails: contentData[id]!,
      siteData: supportedSitesData[contentData[id]!.scraper],
    }),
    [contentData, supportedSitesData],
  );

  useEffect(() => {
    initializeFilterDataFromURL();
    filterData();
  }, []);

  return (
    <>
      <iframe
        ref={iframeRef}
        src={browser.runtime.getURL("/sandbox.html")}
        sandbox="allow-scripts allow-modals allow-same-origin"
        className="hidden"
      />
      <UpdateModal updateContentFunc={updateContentFunc} />
      <BulkUpdateModal bulkUpdateContentFunc={bulkUpdateContentFunc} />
      <button
        className="w-full hover:cursor-pointer"
        onClick={() => {
          reset();
          filterData();
        }}
      >
        <TitleHeader Title="Library" />
      </button>
      <Filters />
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtered.map((key: string) => (
          <ExtendedCard
            iframeRef={iframeRef}
            getContentAndSiteDataByID={getContentAndSiteDataByID}
            isSelected={isSelected}
            key={key}
            id={key}
          />
        ))}
      </div>
      <ServerAffix />
    </>
  );
}
