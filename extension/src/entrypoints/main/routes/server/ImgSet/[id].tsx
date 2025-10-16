import TitleHeader from "@/components/craft/TitleHeader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Grid2X2Check, Image, Trash } from "lucide-react";
import { DocContext, useDoc } from "../contexts/Doc.Context";
import { useMutation } from "@tanstack/react-query";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";

const CoverUpdateModal = ({
  toggleModal,
  updateCover,
  selectedCover,
  getImgURL,
}: any) => {
  return (
    <div
      style={{ zIndex: 2147483647 }}
      className="grid fixed h-screen top-0 right-0 w-full place-items-center"
    >
      <div
        onClick={toggleModal}
        className="h-screen absolute w-full bg-black/10 backdrop-blur-xs"
      />
      <div className="max-w-3xl absolute w-11/12 grid bg-secondary rounded shadow px-8 py-10">
        <div className="w-11/12 bg-input/50 overflow-hidden rounded-sm border-2 mx-auto mb-5">
          <img
            className="object-contain m-auto max-h-[max(16rem,55vh)] w-full min-h-64"
            src={getImgURL(selectedCover)}
          />
        </div>
        <Button onClick={updateCover} className="max-w-sm w-11/12 mx-auto">
          Set As New Cover
        </Button>
      </div>
    </div>
  );
};

export default function ImgSetPage() {
  const { doc, setDoc, serverUrl, Update, removeContent, orpc } =
    useDoc() as DocContext;
  const [selectionState, setSelectionState] = useState<
    "cover" | "remove" | null
  >(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCover, setSelectedCover] = useState("");
  const [imgSetImages, setImgSetImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const { imgSetWidth, setImgSetWidth } = useSettingsData();

  const getImgSetImagesMutation = useMutation(
    orpc.ImgSet.getImages.mutationOptions({
      onSuccess: (res) => {
        setImgSetImages(res);
      },
    })
  );

  const updateCoverMutation = useMutation(
    orpc.ImgSet.setCover.mutationOptions({
      onSuccess: () => {
        alert("ImgSet cover updated");
        setDoc((oldDoc: ContentType) => {
          const temp = { ...oldDoc };
          temp.ext![0] = selectedCover;
          return temp;
        });
        setSelectedCover("");
        toggleModal();
      },
      onError: () => {
        alert("There was an error updating the cover");
        toggleModal();
      },
    })
  );
  const updateCover = useCallback(
    () =>
      updateCoverMutation.mutate({
        ImgFile: selectedCover,
        id: doc.id,
        Name: doc.Title,
      }),
    [selectedCover, doc]
  );

  const removeImgSetMutation = useMutation(
    orpc.ImgSet.removeImages.mutationOptions({
      onSuccess: (res) => {
        setImgSetImages((old) => old.filter((img) => !res.includes(img)));
        setSelected([]);
        alert("Images removed");
      },
      onError: () => {
        alert("There was an error removing the image");
      },
    })
  );
  const removeImgs = useCallback(() => {
    if (confirm("Confirm Deletion"))
      removeImgSetMutation.mutate({ name: doc.Title, imgs: selected });
  }, [selected, doc.Title]);

  const toggleModal = useCallback(() => {
    setOpenModal((old) => !old);
  }, []);

  const onImgClick = useCallback(
    (img: string) => {
      if (!selectionState) return;
      if (selectionState === "remove") {
        setSelected((old) => {
          if (old.includes(img)) return old.filter((o) => o !== img);
          return [...old, img];
        });
      } else {
        setSelectedCover(img);
        toggleModal();
      }
    },
    [selectionState]
  );

  const getImgURL = useCallback(
    (img: any) =>
      doc.id &&
      `${serverUrl}/media/ImgSets/${encodeURIComponent(`${doc.Title}/${img}`)}`,
    [serverUrl, doc.Title, doc.id]
  );

  const isSelected = useCallback(
    (img: string) => {
      if (selectionState !== "remove") return false;
      return selected.includes(img);
    },
    [selected, selectionState]
  );

  useEffect(() => {
    getImgSetImagesMutation.mutate(doc.Title);
  }, [doc.Title]);

  return (
    <>
      {openModal ? (
        <CoverUpdateModal
          selectedCover={selectedCover}
          toggleModal={toggleModal}
          updateCover={updateCover}
          getImgURL={getImgURL}
        />
      ) : (
        <></>
      )}
      <TitleHeader Title="Image Set" />
      <div className="grid place-items-center md:place-items-start md:flex gap-4">
        <img
          className="w-full md:w-3/5 rounded-sm object-contain bg-input/50 max-h-[60vh]"
          src={getImgURL(doc.ext?.[0])}
        />
        <div className="md:w-[calc(40%-1rem)]">
          <div className="mb-3">
            <Button
              className="w-1/2 rounded-r-none bg-neutral-300/10 dark:!bg-neutral-800/30"
              variant="outline"
              onClick={Update.toggleModalFunc}
            >
              Edit
            </Button>
            <Button
              className="w-1/2 rounded-l-none text-red-500 !bg-red-600/10 dark:!bg-red-950/20"
              variant="outline"
              onClick={removeContent}
            >
              Remove
            </Button>
          </div>
          <h1 className="mb-1 text-lg font-semibold font-stretch-condensed">
            {doc.Title}
          </h1>
          <div className="text-muted-foreground text-xs mb-4">
            {new Date(doc.Added).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </div>
          <div className="w-11/12 prose prose-lg max-w-full break-all mb-4">
            <Markdown>{doc.extraData}</Markdown>
          </div>
          <div className="text-sm space-y-1">
            {[...new Set([...doc.Tags.map((k: string) => k.split(":")[0])])]
              .sort()
              .map((parent) => (
                <div key={parent}>
                  {parent}:{" "}
                  <span className="text-muted-foreground">
                    {doc.Tags.filter((k: string) => k.startsWith(parent))
                      .sort()
                      .map((e: string) => e.replace(parent + ":", ""))
                      .join(", ")}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
      <Slider
        className="my-6 w-[calc(100%-2rem)] mx-auto"
        value={[Number(imgSetWidth)]}
        onValueChange={(o) => setImgSetWidth(o[0])}
        max={100}
        step={1}
      />
      <div
        style={{ width: imgSetWidth + "%" }}
        className="mx-auto space-y-2 min-h-96 rounded overflow-hidden"
      >
        {imgSetImages.map((img) => (
          <button
            className={cn(
              "w-full",
              selectionState ? "p-1 border-2 border-foreground my-1" : "",
              isSelected(img) ? "border-red-500" : ""
            )}
            onClick={() => onImgClick(img)}
          >
            <img loading="lazy" className="w-full" src={getImgURL(img)} />
          </button>
        ))}
      </div>
      <div className="fixed bottom-8 right-8 grid gap-5">
        {selectionState === "remove" ? (
          <div className="relative">
            <span className="mx-auto block text-center text-sm mb-3">
              {String(selected.length).padStart(2, "0")}
            </span>
            <Button
              disabled={!selected.length}
              onClick={removeImgs}
              variant="secondary"
              size="icon"
              className="p-2 scale-150 backdrop-blur-xs border-2 border-red-500 "
            >
              <Trash className="text-red-500" size={"3rem"} />
            </Button>
          </div>
        ) : (
          <></>
        )}
        <Button
          onClick={() => {
            setSelected([]);
            setSelectionState((old) => (old === "remove" ? null : "remove"));
          }}
          variant="secondary"
          size="icon"
          className={
            "p-2 scale-150 backdrop-blur-xs border-2 " +
            (selectionState === "remove" ? "!border-foreground" : "")
          }
        >
          <Grid2X2Check size={"3rem"} />
        </Button>
        <Button
          onClick={() =>
            setSelectionState((old) => (old === "cover" ? null : "cover"))
          }
          variant="secondary"
          size="icon"
          className={
            "p-2 scale-150 backdrop-blur-xs border-2 " +
            (selectionState === "cover" ? "!border-foreground" : "")
          }
        >
          <Image size={"3rem"} />
        </Button>
      </div>
    </>
  );
}
