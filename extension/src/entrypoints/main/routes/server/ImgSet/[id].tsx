import TitleHeader from "@/components/craft/TitleHeader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Grid2X2Check, Image, Trash } from "lucide-react";
import { DocContext, useDoc } from "../contexts/Doc.Context";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import DocInfoSection from "../components/DocInfoSection";
import LazyVideo from "@/components/LazyVideo";

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
        setSelectionState(null);
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
    if (selected.length === 0) {
      alert("No images selected");
      return;
    }
    if (selected.length >= imgSetImages.length) {
      alert("All images selected, Just delete the imgSet already");
      return;
    }
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
      } else if (img.endsWith("mp4")) return;
      else {
        setSelectedCover(img);
        toggleModal();
      }
    },
    [selectionState]
  );

  const getImgURL = useCallback(
    (img: any) =>
      doc.id
        ? `${serverUrl}/media/ImgSets/${encodeURIComponent(
            `${doc.Title}/${img}`
          )}`
        : undefined,
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
      <div className="grid place-items-center sm:place-items-start sm:flex gap-4">
        <img
          className="w-full sm:w-3/5 rounded-sm object-contain bg-input/50 max-h-[60vh]"
          src={getImgURL(doc.ext?.[0])}
        />
        <DocInfoSection
          doc={doc}
          removeContent={removeContent}
          toggleModalFunc={Update.toggleModalFunc}
        />
      </div>
      <div className="h-10 sticky top-19 grid bg-background">
        <Slider
          className="w-[calc(100%-2rem)] m-auto z-10"
          value={[Number(imgSetWidth)]}
          onValueChange={(o) => setImgSetWidth(o[0])}
          max={100}
          step={1}
        />
      </div>
      <div
        style={{ width: imgSetWidth + "%" }}
        className="mx-auto space-y-2 min-h-96 rounded overflow-hidden"
      >
        {imgSetImages.map((img) => (
          <button
            key={img}
            className={cn(
              "w-full",
              selectionState ? "p-1 border-2 border-foreground my-1" : "",
              isSelected(img) ? "border-red-500" : ""
            )}
            onClick={() => onImgClick(img)}
          >
            {img.endsWith("mp4") ? (
              <LazyVideo src={getImgURL(img)} />
            ) : (
              <img loading="lazy" className="w-full" src={getImgURL(img)} />
            )}
          </button>
        ))}
      </div>
      <div className="fixed bottom-4 right-4 grid gap-1">
        {selectionState === "remove" ? (
          <div className="flex gap-1">
            <Button
              onClick={() => {
                if (imgSetImages.length === selected.length) setSelected([]);
                else if (confirm("Select All ?")) setSelected(imgSetImages);
              }}
              variant="secondary"
              size="icon"
              className={
                "backdrop-blur-xs border-2 size-12 " +
                (imgSetImages.length === selected.length
                  ? "border-foreground!"
                  : "")
              }
            >
              {String(selected.length).padStart(2, "0")}
            </Button>
            <Button
              onClick={removeImgs}
              variant="secondary"
              size="icon"
              className="backdrop-blur-xs border-2 border-red-500 size-12"
            >
              <Trash className="text-red-500 scale-125" />
            </Button>
          </div>
        ) : (
          <></>
        )}
        <div className="flex gap-1">
          <Button
            onClick={() =>
              setSelectionState((old) => (old === "cover" ? null : "cover"))
            }
            variant="secondary"
            size="icon"
            className={
              "backdrop-blur-xs border-2 size-12 " +
              (selectionState === "cover" ? "border-foreground!" : "")
            }
          >
            <Image className="scale-125" />
          </Button>
          <Button
            onClick={() => {
              setSelected([]);
              setSelectionState((old) => (old === "remove" ? null : "remove"));
            }}
            variant="secondary"
            size="icon"
            className={
              "backdrop-blur-xs border-2 size-12 " +
              (selectionState === "remove" ? "border-foreground!" : "")
            }
          >
            <Grid2X2Check className="scale-125" />
          </Button>
        </div>
      </div>
    </>
  );
}
