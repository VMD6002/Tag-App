import TitleHeader from "@/components/craft/TitleHeader";
import Filters from "./components/Filters";
import ExtendedCard from "./components/ExtendedCard";
import UpdateModal from "@/components/craft/UpdateModal";
import BulkUpdateModal from "@/components/craft/BulkUpdateModal";
import { useAtomValue } from "jotai";
import { useResetFilter } from "@/entrypoints/main/atoms/filter";
import {
  filteredAtom,
  RemoteProvider,
  useRemoteContext,
} from "./Remote.Context";
import ServerAffix from "@/components/craft/ServerAffix";

function Remote() {
  const {
    iframeRef,
    afterAddRemoveScript,
    filterData,
    setContentFunc,
    bulkUpdateTags,
    tags,
  } = useRemoteContext();

  const filtered = useAtomValue(filteredAtom);
  const reset = useResetFilter();

  return (
    <>
      {afterAddRemoveScript && (
        <iframe
          ref={iframeRef}
          src={
            typeof browser !== "undefined"
              ? browser.runtime.getURL("/sandbox.html")
              : "/sandbox.html"
          }
          sandbox="allow-scripts allow-modals allow-same-origin"
          className="hidden"
        />
      )}
      <UpdateModal updateContentFunc={setContentFunc} tags={tags} />
      <BulkUpdateModal bulkUpdateContentFunc={bulkUpdateTags} tags={tags} />

      <button
        className="w-full text-left hover:cursor-pointer bg-transparent border-none p-0 appearance-none"
        onClick={() => {
          reset();
          filterData();
        }}
      >
        <TitleHeader Title="Remote Library" />
      </button>

      <Filters />

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
        {filtered.map((contentDetails) => (
          <ExtendedCard
            contentDetails={contentDetails}
            key={contentDetails.id}
          />
        ))}
      </div>

      <ServerAffix filtered={filtered} />
    </>
  );
}

export default function WrappedRemote() {
  return (
    <RemoteProvider>
      <Remote />
    </RemoteProvider>
  );
}
