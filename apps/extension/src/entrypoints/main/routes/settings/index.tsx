import TitleHeader from "@/components/craft/TitleHeader";
import Restore from "./Restore";
import Backup from "./Backup";
import Other from "./Other";
import Server from "./Server";
import Users from "./Users";
import AppMode from "./AppMode";
import Constants from "./Constants";
import Hostnames from "./Hostnames";

export default function Settings() {
  return (
    <>
      <TitleHeader Title="Settings" />
      <div className="mx-auto grid sm:grid-cols-2 gap-6 w-fit">
        <Users />
        <Restore />
        <Server />
        <Other />
        <AppMode />
        <Backup />
        <Constants />
        <Hostnames />
      </div>
    </>
  );
}
