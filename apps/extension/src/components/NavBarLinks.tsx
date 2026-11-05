import { useAtom, useAtomValue } from "jotai";
import { Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { currentUserAtom, userListAtom } from "@/entrypoints/main/atoms/user";
import { ModeToggle } from "./mode-toggle";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const Links = {
  Library: "/",
  Tags: "/tags",
  Settings: "/settings",
  "Supported Sites": "/supported",
};

function SelectActiveUser() {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const userList = useAtomValue(userListAtom);

  if (userList.length <= 1) return null;

  return (
    <Select
      value={currentUser}
      onValueChange={(val) => val && setCurrentUser(val)}
    >
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
  const currentUrl = useHashLocation()[0];

  const NameAndPath = Object.entries(Links);

  return (
    <NavigationMenu>
      <NavigationMenuList className="space-x-2">
        {NameAndPath.map(([name, path]) => (
          <NavigationMenuItem
            key={`Desktop-Nav-Link-${name}`}
            className={"hidden min-[55rem]:block"}
          >
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              render={
                <Link
                  className={
                    currentUrl === path ? "underline underline-offset-2" : ""
                  }
                  href={path}
                />
              }
            >
              {name}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        <NavigationMenuItem className={"w-32 min-[55rem]:hidden"}>
          <NavigationMenuTrigger className="ml-11">Menu</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-4">
              <li>
                {NameAndPath.map(([name, path]) => (
                  <NavigationMenuLink
                    key={`Mobile-Nav-Link-${name}`}
                    render={
                      <Link
                        className={`whitespace-nowrap ${
                          currentUrl === path
                            ? "underline underline-offset-2"
                            : ""
                        }`}
                        href={path}
                      />
                    }
                  >
                    {name}
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
