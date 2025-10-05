import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLocal } from "../Local.Context";
import type { LocalContext } from "../Local.Context";
import { memo } from "react";

const ExtendedCard = memo(({ id }: { id: string }) => {
  try {
    const {
      removeContents,
      setFiltered,
      Selection,
      Update,
      getContentByID,
      isSelected,
    } = useLocal() as LocalContext;

    const { Url, CoverUrl, Title, Tags, Added, extraData } = getContentByID(id);

    const updateSetupFunc = useCallback(() => {
      Update.setTitle(Title);
      Update.setCoverUrl(CoverUrl!);
      Update.setExtraData(extraData);
      Update.setTags(Tags.map((o: string) => ({ label: o, value: o })));
      Update.ID.current = id;
      Update.toggleModalFunc();
    }, [Title, Tags, Update.Data]);

    const removeContent = useCallback(() => {
      if (!confirm("Confirm Deletion")) return;
      removeContents([id]);
      setFiltered((old: string[]) => old.filter((val) => val !== id));
    }, [id]);

    const Selected = useMemo(() => isSelected(id), [isSelected, id]);

    return (
      <div
        onClick={() => Selection.on && Selection.selectEntry(id)}
        className={
          "block p-2 h-fit relative text-left " +
          (Selection.on ? "border-2 rounded-sm" : "") +
          " " +
          (Selected ? "border-white opacity-80" : "")
        }
      >
        <div className="w-full mb-5 bg-input/50 overflow-hidden rounded-sm">
          <img
            loading="lazy"
            className="object-contain m-auto max-h-[max(8.25rem,55vh)] w-full min-h-33"
            src={CoverUrl}
          />
        </div>
        <div className="w-[95%] ml-[2.5%] break-all">
          <div className="mb-3">
            <Button
              disabled={Selection.on}
              onClick={updateSetupFunc}
              className="w-1/2 rounded-r-none hover:bg-neutral-300/20 bg-neutral-300/10 dark:!bg-neutral-800/30 dark:hover:!bg-neutral-700/30"
              variant="outline"
            >
              Edit
            </Button>
            <Button
              disabled={Selection.on}
              onClick={removeContent}
              className="w-1/2 rounded-l-none text-red-500 !bg-red-600/10 dark:!bg-red-950/20"
              variant="outline"
            >
              Remove
            </Button>
          </div>
          <a href={Url} target="_blank">
            <h1 className="mb-1 text-lg font-semibold font-stretch-condensed">
              {Title}
            </h1>
          </a>
          <div className="text-muted-foreground text-xs mb-4">
            {new Date(Added).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
          <div className="text-sm space-y-1">
            {[...new Set(Tags.map((tag: string) => tag.split(":")[0]))]
              .sort()
              .map((parent) => (
                <div>
                  {(parent as string).replaceAll("_", " ")} :{" "}
                  <span className="text-muted-foreground">
                    {Tags.filter((tag: string) =>
                      tag.startsWith(parent as string)
                    )
                      .sort()
                      .map((e: string) =>
                        e.replace(parent + ":", "").replaceAll("_", " ")
                      )
                      .join(", ")}
                  </span>
                </div>
              ))}
          </div>
        </div>
        {Selection.on ? (
          <>
            {Selected ? (
              <Check className="bg-foreground border-background border-[1px] top-4 left-4 text-background absolute rounded-sm" />
            ) : (
              <div className="bg-background border-foreground border-[1px] aspect-square h-5 top-4 left-4 text-background absolute rounded-sm" />
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    );
  } catch (err) {
    console.error(err);
    return <></>;
  }
});

export default ExtendedCard;
