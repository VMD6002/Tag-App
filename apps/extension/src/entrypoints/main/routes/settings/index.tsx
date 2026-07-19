import TitleHeader from "@/components/craft/TitleHeader";
import Restore from "./components/Restore";
import Backup from "./components/Backup";
import Server from "./components/Server";
import Users from "./components/Users";
import AppMode from "./components/AppMode";
import Constants from "./components/Constants";
import Hostnames from "./components/Hostnames";
import { useAtomValue } from "jotai";
import { appModeAtom } from "../../atoms/settings";
import RemoteConstants from "./components/remote/Constants";
import RemoteRestore from "./components/remote/Restore";
import RemoteBackup from "./components/remote/Backup";
import FilteredDataPost from "./components/FilteredDataPost";

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
          </>
        ) : (
          <>
            <Server />
            <RemoteConstants />
            <RemoteRestore />
            <RemoteBackup />
          </>
        )}
      </div>
    </>
  );
}
