import TitleHeader from "@/components/craft/TitleHeader";
import Filters from "./components/Filters";
import ExtendedCard from "./components/ExtendedCard";
import { useSetAtom, useAtomValue } from "jotai";
import {
  filteredAtom,
  RemoteProvider,
  useRemoteContext,
} from "./Remote.Context";
import { resetFilterAtom } from "@/atom";

function Library() {
  const { filterData } = useRemoteContext();

  const filtered = useAtomValue(filteredAtom);
  const reset = useSetAtom(resetFilterAtom);

  return (
    <>
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
