import TitleHeader from "@/components/craft/TitleHeader";
import Filters from "./components/Filters";
import ServerAffix from "./components/ServerAffix";
import ExtendedCard from "./components/ExtendedCard";
import UpdateModal from "@/components/craft/UpdateModal";
import BulkUpdateModal from "@/components/craft/BulkUpdateModal";
import { useSetAtom, useAtomValue } from "jotai";
import { resetFilterAtom } from "@/entrypoints/main/atoms/filter";
import {
  filteredAtom,
  RemoteProvider,
  useRemoteContext,
} from "./Remote.Context";

function Remote() {
  const { iframeRef, filterData, setContentFunc, bulkUpdateTags } =
    useRemoteContext();

  const filtered = useAtomValue(filteredAtom);
  const reset = useSetAtom(resetFilterAtom);

  return (
    <>
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
      <UpdateModal updateContentFunc={setContentFunc} />
      <BulkUpdateModal bulkUpdateContentFunc={bulkUpdateTags} />

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

      <ServerAffix iframeRef={iframeRef} />
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
