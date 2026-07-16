import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "./mode-toggle";
import { Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useAtom, useAtomValue } from "jotai";
import { appModeAtom } from "../entrypoints/main/atoms/settings";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { currentUserAtom, userListAtom } from "@/entrypoints/main/atoms/user";

const local = {
  Library: "/",
  Tags: "/tags",
  Settings: "/settings",
  "Supprted Sites": "/supported",
};

const remote = {
  ...local,
  "Remote Tags": "/remote/tags",
};

const LINKS = {
  local,
  remote,
};

function SelectActiveUser() {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const userList = useAtomValue(userListAtom);

  return (
    <Select value={currentUser} onValueChange={(val) => setCurrentUser(val)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select active user" />
      </SelectTrigger>
      <SelectContent className="max-w-sm min-w-0">
        <SelectGroup>
          {userList.map((user) => (
            <SelectItem key={`user-select-${user}`} value={user}>
              {user}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default function NavBarLinks() {
  const mode = useAtomValue(appModeAtom);
  const currentUrl = useHashLocation()[0];

  const NameAndPath = Object.entries(LINKS[mode]);

  return (
    <NavigationMenu>
      <NavigationMenuList className="space-x-2">
        {NameAndPath.map(([name, path]) => (
          <NavigationMenuItem
            key={`Desktop-Nav-Link-${name}`}
            className={"hidden min-[55rem]:block"}
          >
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link
                className={
                  currentUrl === path ? "underline underline-offset-2" : ""
                }
                href={path}
              >
                {name}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem className={"w-32 min-[55rem]:hidden"}>
          <NavigationMenuTrigger className="ml-11">Menu</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-4">
              <li>
                {NameAndPath.map(([name, path]) => (
                  <NavigationMenuLink key={`Mobile-Nav-Link-${name}`} asChild>
                    <Link
                      className={`whitespace-nowrap ${
                        currentUrl === path
                          ? "underline underline-offset-2"
                          : ""
                      }`}
                      href={path}
                    >
                      {name}
                    </Link>
                  </NavigationMenuLink>
                ))}
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <SelectActiveUser />
        <ModeToggle />
      </NavigationMenuList>
    </NavigationMenu>
  );
}
