import { useAtomValue, useSetAtom } from "jotai";
import { Library as LibraryIcon, SearchX } from "lucide-react";
import { filterActiveAtom, resetFilterAtom } from "@/atom";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/craft/EmptyState";
import TitleHeader from "@/components/craft/TitleHeader";
import { Button } from "@/components/ui/button";
import ExtendedCard from "./components/ExtendedCard";
import Filters from "./components/Filters";
import {
  filteredAtom,
  RemoteProvider,
  useRemoteContext,
} from "./Remote.Context";

function Library() {
  const { filterData, loadState } = useRemoteContext();

  const filtered = useAtomValue(filteredAtom);
  const reset = useSetAtom(resetFilterAtom);
  const filterActive = useAtomValue(filterActiveAtom);

  const resetAll = () => {
    reset();
    filterData();
  };

  return (
    <>
      <TitleHeader
        Title="Library"
        description="Everything saved on the server. Search or filter by tags."
        onTitleClick={resetAll}
        titleHint="Reset all filters and reload"
      />
      <Filters />
      {loadState.isError ? (
        <ErrorState
          title="Couldn't load the library"
          message={loadState.message}
          onRetry={() => filterData()}
        />
      ) : loadState.isPending && filtered.length === 0 ? (
        <LoadingState label="Loading the library…" />
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
            title="The library is empty"
            description="Items saved with the TagApp extension in remote mode show up here."
          />
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
    </>
  );
}

export default function WrappedLibray() {
  return (
    <RemoteProvider>
      <Library />
    </RemoteProvider>
  );
}
