import TitleHeader from "@/components/craft/TitleHeader";
import Restore from "./components/Restore";
import Backup from "./components/Backup";
import Server from "./components/Server";
import Users from "./components/Users";
import AppMode from "./components/AppMode";
import Constants from "./components/Constants";
import Hostnames from "./components/Hostnames";
import ContentDataScript from "./components/ContentDataScript";

export default function Settings() {
  return (
    <>
      <TitleHeader Title="Settings" />
      <div className="mx-auto grid sm:grid-cols-2 gap-6 w-fit">
        <Users />
        <AppMode />
        <Constants />
        <Hostnames />
        <ContentDataScript />
        <Server />
        <Restore />
        <Backup />
      </div>
    </>
  );
}
