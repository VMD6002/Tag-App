import TitleHeader from "@/components/craft/TitleHeader";
import Filters from "./components/Filters";
import ServerAffix from "./components/ServerAffix";
import ExtendedCard from "./components/ExtendedCard";
import { LocalProvider, useLocal } from "./Local.Context";
import type { LocalContext } from "./Local.Context";
import UpdateModal from "@/components/craft/UpdateModal";
import BulkUpdateModal from "@/components/craft/BulkUpdateModal";

function Child() {
  const {
    filtered,
    Update,
    updateContentFunc,
    bulkUpdateContentFunc,
    Selection,
  } = useLocal() as LocalContext;

  return (
    <>
      <UpdateModal Update={Update} updateContentFunc={updateContentFunc} />
      <BulkUpdateModal
        Selection={Selection}
        bulkUpdateContentFunc={bulkUpdateContentFunc}
      />
      <TitleHeader Title="Library" />
      <Filters />
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtered.map((key: string) => (
          <ExtendedCard key={key} id={key} />
        ))}
      </div>
      <ServerAffix />
    </>
  );
}

export default function Library() {
  return (
    <LocalProvider>
      <Child />
    </LocalProvider>
  );
}
