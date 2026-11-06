import { useAtomValue } from "jotai";
import { SettingsSection } from "@/components/craft/Settings";
import TitleHeader from "@/components/craft/TitleHeader";
import { appModeAtom } from "../../atoms/settings";
import AppMode, { SanitizeTitle } from "./components/AppMode";
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
  const remote = appMode === "remote";
  return (
    <div className="max-w-4xl pb-10">
      <TitleHeader
        Title="Settings"
        description="Saved per profile, in this browser. Fields with a Save button only change once you press it; checkboxes apply immediately."
      />
      <SettingsSection
        title="Profiles"
        description="Switch between separate libraries, or create a new one."
      >
        <Users />
      </SettingsSection>
      <SettingsSection
        title="Storage and connection"
        description="Choose where the library lives. Remote mode needs a running TagApp server."
      >
        <AppMode />
        {remote && <Server />}
      </SettingsSection>
      <SettingsSection
        title="Saving items"
        description="How titles and URLs are processed when you save an item."
      >
        <SanitizeTitle />
        {remote ? <RemoteConstants /> : <Constants />}
      </SettingsSection>
      <SettingsSection
        title="Site scripts"
        description="Optional code attached to a supported site. Write the scripts on the Supported Sites page."
      >
        {remote ? <RemoteSiteScripts /> : <SiteScripts />}
      </SettingsSection>
      <SettingsSection
        title="Connected pages"
        description="Web addresses TagApp shares data with."
      >
        <Hostnames />
        <FilteredDataPost />
      </SettingsSection>
      <SettingsSection
        title="Backup and restore"
        description={
          remote
            ? "Copies of the data stored on your server."
            : "Copies of the data stored in this browser."
        }
      >
        {remote ? <RemoteBackup /> : <Backup />}
        {remote ? <RemoteRestore /> : <Restore />}
      </SettingsSection>
    </div>
  );
}
