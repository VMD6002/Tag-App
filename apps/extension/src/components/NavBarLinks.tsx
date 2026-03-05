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
import { serverFeaturesAtom } from "../entrypoints/main/atoms/settings";

const Links = [
  { Name: "Library", Path: "/" },
  { Name: "Tags", Path: "/tags" },
];

const Links2 = [
  { Name: "Settings", Path: "/settings" },
  { Name: "Supprted Sites", Path: "/supported" },
];

const ServerRelatedPageLinks = [
  { Name: "Server Tags", Path: "/server/tags" },
  { Name: "Server Library", Path: "/server" },
];

export default function NavBarLinks() {
  const serverFeatures = useAtomValue(serverFeaturesAtom);
  const currentUrl = useHashLocation()[0];
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {(serverFeatures
          ? [...Links, ...ServerRelatedPageLinks, ...Links2]
          : [...Links, ...Links2]
        ).map((link) => (
          <NavigationMenuItem
            key={`Desktop-Nav-Link-${link.Name}`}
            className={
              serverFeatures ? "hidden min-[830px]:block" : "hidden sm:block"
            }
          >
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link
                className={
                  currentUrl === link.Path ? "underline underline-offset-2" : ""
                }
                href={link.Path}
              >
                {link.Name}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
        <div
          className={
            serverFeatures ? "hidden min-[830px]:block" : "hidden sm:block"
          }
        >
          <ModeToggle />
        </div>
        <NavigationMenuItem
          className={
            serverFeatures ? "w-32 min-[830px]:hidden" : "w-32 sm:hidden"
          }
        >
          <NavigationMenuTrigger className="ml-11">Menu</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-4">
              <li>
                {(serverFeatures
                  ? [...Links, ...ServerRelatedPageLinks, ...Links2]
                  : [...Links, ...Links2]
                ).map((link) => (
                  <NavigationMenuLink
                    key={`Mobile-Nav-Link-${link.Name}`}
                    asChild
                  >
                    <Link
                      className={`whitespace-nowrap ${
                        currentUrl === link.Path
                          ? "underline underline-offset-2"
                          : ""
                      }`}
                      href={link.Path}
                    >
                      {link.Name}
                    </Link>
                  </NavigationMenuLink>
                ))}
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <div
          className={
            serverFeatures ? "ml-2 min-[830px]:hidden" : "ml-2 sm:hidden"
          }
        >
          <ModeToggle />
        </div>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
