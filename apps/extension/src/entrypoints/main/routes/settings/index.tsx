import { useAtomValue } from "jotai";
import TitleHeader from "@/components/craft/TitleHeader";
import { appModeAtom } from "../../atoms/settings";
import AppMode from "./components/AppMode";
import Backup from "./components/Backup";
import Constants from "./components/Constants";
import FilteredDataPost from "./components/FilteredDataPost";
import Hostnames from "./components/Hostnames";
import Restore from "./components/Restore";
import RemoteBackup from "./components/remote/Backup";
import RemoteConstants from "./components/remote/Constants";
import RemoteRestore from "./components/remote/Restore";
import RemoteSiteScripts from "./components/remote/SiteScripts";
import Server from "./components/Server";
import SiteScripts from "./components/SiteScripts";
import Users from "./components/Users";

export default function Settings() {
  const appMode = useAtomValue(appModeAtom);
  return (
    <>
      <TitleHeader Title="Settings" />
      <div className="mx-auto grid sm:grid-cols-2 gap-6 w-fit">
        <Users />
        <AppMode />
        <Hostnames />
        <FilteredDataPost />
        {appMode === "local" ? (
          <>
            <Constants />
            <Restore />
            <Backup />
            <SiteScripts />
          </>
        ) : (
          <>
            <Server />
            <RemoteConstants />
            <RemoteRestore />
            <RemoteBackup />
            <RemoteSiteScripts />
          </>
        )}
      </div>
    </>
  );
}
