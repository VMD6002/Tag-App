import { Link, useLocation } from "wouter";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./mode-toggle";

const Links = [
  { Name: "Library", Path: "/" },
  { Name: "Tags", Path: "/tags" },
];

export default function NavBarLinks() {
  const [currentUrl] = useLocation();
  return (
    <div className="flex items-center gap-1.5">
      <nav aria-label="Main" className="flex items-center gap-1">
        {Links.map((link) => (
          <Link
            key={`Nav-Link-${link.Name}`}
            href={link.Path}
            aria-current={currentUrl === link.Path ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-8 px-3",
              currentUrl === link.Path
                ? "bg-muted text-foreground"
                : "text-muted-foreground",
            )}
          >
            {link.Name}
          </Link>
        ))}
      </nav>
      <ModeToggle />
    </div>
  );
}
