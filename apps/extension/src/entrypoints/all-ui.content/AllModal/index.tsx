import { atom, getDefaultStore, useAtomValue } from "jotai";
import { useState } from "react";
import { updateResetOptionsAtom } from "@/components/craft/UpdateModal/atom";
import MyQueryProvider from "@/components/MyQueryProvider";
import { appModeAtom } from "@/entrypoints/main/atoms/settings";
import GetDetailsFromPage from "@/lib/GetDetailsFromPage";
import GetTagAppSiteData from "@/lib/GetTagAppSiteData";
import LocalContent from "./LocalContent";
import RemoteContent from "./RemoteContent";

const store = getDefaultStore();

store.set(updateResetOptionsAtom, {
  title: () => GetDetailsFromPage().title,
  cover: () => GetDetailsFromPage().cover,
  tags: () =>
    GetDetailsFromPage().defaultTags.map((o) => ({ label: o, value: o })),
  contentUrl: () => GetDetailsFromPage().contentUrl,
  preset: () => GetTagAppSiteData().download?.defaultPreset,
  extraData: () =>
    `Web: [${GetDetailsFromPage().url}](${GetDetailsFromPage().url})${GetDetailsFromPage().extraData ? `\n${GetDetailsFromPage().extraData}` : ""}`,
});

export const loadAtom = atom(false);

export default function App() {
  const [initialLoad, setInitialLoad] = useState<boolean>(false);
  const appMode = useAtomValue(appModeAtom);

  if (!initialLoad)
    return (
      <>
        <form
          style={{ display: "none" }}
          onSubmit={(e) => {
            e.preventDefault();
            setInitialLoad(true);
          }}
        >
          <input id="loadAndRefresh" type="submit" />
        </form>
        <form
          style={{ display: "none" }}
          onSubmit={(e) => {
            e.preventDefault();
            setInitialLoad(false);
          }}
        >
          <input id="remove" type="submit" />
        </form>
      </>
    );
  return (
    <MyQueryProvider>
      {appMode === "local" ? <LocalContent /> : <RemoteContent />}
    </MyQueryProvider>
  );
}
