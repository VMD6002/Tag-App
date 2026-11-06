import { Upload } from "lucide-react";
import { type ReactNode, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/** Titled block of related settings: heading + summary on the left, fields on the right. */
export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className="grid grid-cols-1 gap-5 border-t py-8 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10"
    >
      <div>
        <h2 id={id} className="text-sm font-semibold">
          {title}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="grid min-w-0 content-start gap-7">{children}</div>
    </section>
  );
}

/** One setting: label, what it does, the control, and an optional action row. */
export function SettingField({
  label,
  help,
  htmlFor,
  children,
}: {
  label: string;
  help?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="grid gap-0.5">
        <Label htmlFor={htmlFor} className="text-sm">
          {label}
        </Label>
        {help && (
          <p className="max-w-prose text-xs text-muted-foreground">{help}</p>
        )}
      </div>
      {children}
    </div>
  );
}

/** Save button that only enables when there is something to save. */
export function SaveRow({
  dirty,
  onSave,
  label = "Save",
}: {
  dirty: boolean;
  onSave: () => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button size="sm" disabled={!dirty} onClick={onSave}>
        {label}
      </Button>
      <span aria-live="polite" className="text-xs text-muted-foreground">
        {dirty ? "Unsaved changes" : "Up to date"}
      </span>
    </div>
  );
}

/** Theme-styled replacement for a bare native file input. The input stays in the DOM for the caller's onChange. */
export function FilePickButton({
  label,
  onChange,
  accept = ".json,application/json",
}: {
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
        tabIndex={-1}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => ref.current?.click()}
        className="w-fit"
      >
        <Upload />
        {label}
      </Button>
    </>
  );
}
