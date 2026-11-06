import { useAtomValue } from "jotai";
import { Library as LibraryIcon, SearchX } from "lucide-react";
import { Link } from "wouter";
import BulkUpdateModal from "@/components/craft/BulkUpdateModal";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/craft/EmptyState";
import ServerAffix from "@/components/craft/ServerAffix";
import TitleHeader from "@/components/craft/TitleHeader";
import UpdateModal from "@/components/craft/UpdateModal";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  filterActiveAtom,
  useInjectFilterDataIntoURL,
  useResetFilter,
} from "@/entrypoints/main/atoms/filter";
import ExtendedCard from "./components/ExtendedCard";
import Filters from "./components/Filters";
import {
  filteredAtom,
  RemoteProvider,
  useRemoteContext,
} from "./Remote.Context";

function Remote() {
  const {
    loadState,
    iframeRef,
    filterData,
    setContentFunc,
    bulkUpdateTags,
    afterAddRemoveScript,
    tags,
  } = useRemoteContext();

  const filtered = useAtomValue(filteredAtom);
  const reset = useResetFilter();
  const injectFilterDataIntoURL = useInjectFilterDataIntoURL();
  const filterActive = useAtomValue(filterActiveAtom);
  const resetAll = () => {
    reset();
    injectFilterDataIntoURL();
    filterData();
  };

  return (
    <>
      {afterAddRemoveScript && (
        <iframe
          ref={iframeRef}
          title="Script Sandbox"
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

      <TitleHeader
        Title="Remote Library"
        description="Items saved on your TagApp server. Search, filter by tags, or select several items to edit together."
        onTitleClick={resetAll}
        titleHint="Reset all filters and reload"
      />

      <Filters />

      {loadState.isError ? (
        <ErrorState
          title="Couldn't load your library"
          message={loadState.message}
          onRetry={() => filterData()}
        >
          <Link
            href="/settings"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Check server address
          </Link>
        </ErrorState>
      ) : loadState.isPending && filtered.length === 0 ? (
        <LoadingState
          label="Loading the remote library…"
          hint="Taking long? Check the server address in Settings."
        />
      ) : filtered.length === 0 ? (
        filterActive ? (
          <EmptyState
            icon={SearchX}
            title="No items match these filters"
            description="Try removing a tag or shortening the search."
          >
            <Button variant="outline" size="sm" onClick={resetAll}>
              Clear filters and show everything
            </Button>
          </EmptyState>
        ) : (
          <EmptyState
            icon={LibraryIcon}
            title="Your library is empty"
            description="Open a page on one of your supported sites and use the Add button that appears on it to save it here."
          >
            <Link
              href="/supported"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              View supported sites
            </Link>
          </EmptyState>
        )
      ) : (
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
          {filtered.map((contentDetails) => (
            <ExtendedCard
              contentDetails={contentDetails}
              key={contentDetails.id}
            />
          ))}
        </div>
      )}

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
