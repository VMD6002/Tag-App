import { X } from "lucide-react";
import { type ReactNode, useEffect, useId } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shared dialog chrome for the hand-rolled modals (update, bulk update, tag cover).
 * Plain fixed positioning on purpose: it must work inside the content script's shadow root.
 */
export default function ModalShell({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{ zIndex: 2147483647 }}
      className="fixed inset-0 grid place-items-center overflow-y-auto p-4"
    >
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-black/40 backdrop-blur-xs"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative my-auto grid w-full max-w-md gap-4 border bg-popover p-5 text-popover-foreground shadow-xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
            title="Close (Esc)"
          >
            <X />
          </Button>
        </div>
        {children}
        {footer && (
          <div className="flex flex-wrap justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}
