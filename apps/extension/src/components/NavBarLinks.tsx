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
import { useAtomValue } from "jotai";
import { appModeAtom } from "../entrypoints/main/atoms/settings";

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

export default function NavBarLinks() {
  const mode = useAtomValue(appModeAtom);
  const currentUrl = useHashLocation()[0];

  const NameAndPath = Object.entries(LINKS[mode]);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {NameAndPath.map(([name, path]) => (
          <NavigationMenuItem
            key={`Desktop-Nav-Link-${name}`}
            className={"hidden sm:block"}
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
        <div className={"hidden sm:block"}>
          <ModeToggle />
        </div>
        <NavigationMenuItem className={"w-32 sm:hidden"}>
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
        <div className={"ml-2 sm:hidden"}>
          <ModeToggle />
        </div>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
