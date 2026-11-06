import { useAtom, useAtomValue } from "jotai";
import { Menu, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUserAtom, userListAtom } from "@/entrypoints/main/atoms/user";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./mode-toggle";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
      <SelectTrigger
        size="sm"
        aria-label="Active profile"
        title="Active profile"
        className="max-w-24 min-w-0 sm:max-w-36"
      >
        <User className="text-muted-foreground" aria-hidden />
        <SelectValue placeholder="Profile" />
      </SelectTrigger>
      <SelectContent className="max-w-sm min-w-0" align="end">
        <SelectGroup>
          <SelectLabel>Switch profile</SelectLabel>
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
  const [currentUrl] = useLocation();

  const NameAndPath = Object.entries(Links);

  return (
    <div className="flex items-center gap-1.5">
      <nav
        aria-label="Main"
        className="hidden items-center gap-1 min-[55rem]:flex"
      >
        {NameAndPath.map(([name, path]) => (
          <Link
            key={`Desktop-Nav-Link-${name}`}
            href={path}
            aria-current={currentUrl === path ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 px-3",
              currentUrl === path
                ? "bg-muted text-foreground"
                : "text-muted-foreground",
            )}
          >
            {name}
          </Link>
        ))}
      </nav>
      <div className="min-[55rem]:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
            <Menu aria-hidden />
            Menu
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            {NameAndPath.map(([name, path]) => (
              <DropdownMenuItem
                key={`Mobile-Nav-Link-${name}`}
                render={
                  <Link
                    href={path}
                    aria-current={currentUrl === path ? "page" : undefined}
                  />
                }
                className={currentUrl === path ? "bg-muted font-medium" : ""}
              >
                {name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <SelectActiveUser />
      <ModeToggle />
    </div>
  );
}
