import TitleHeader from "@/components/craft/TitleHeader";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Image } from "lucide-react";
import { DocContext, useDoc } from "../contexts/Doc.Context";
import { useMutation, useQuery } from "@tanstack/react-query";
import Markdown from "react-markdown";

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
  const [coverSelectMode, setCoverSelectMode] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCover, setSelectedCover] = useState("");
  const { imgSetWidth, setImgSetWidth } = useSettingsData();

  const ImgSetImagesQuery = useQuery(
    orpc.ImgSet.getImages.queryOptions({
      input: doc.Title,
    })
  );

  const updateCoverMutation = useMutation(
    orpc.ImgSet.setCover.mutationOptions({
      onSuccess: () => {
        alert("ImgSet cover updated");
        setDoc((oldDoc: ContentType) => {
          const temp = { ...oldDoc };
          // @ts-ignore
          temp.ext[0] = selectedCover;
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

  const toggleModal = useCallback(() => {
    setOpenModal((old) => !old);
  }, []);

  const onImgClick = useCallback(
    (img: string) => {
      setSelectedCover(img);
      toggleModal();
    },
    [coverSelectMode]
  );

  const getImgURL = useCallback(
    (img: any) =>
      doc.id &&
      `${serverUrl}/media/ImgSets/${encodeURIComponent(`${doc.Title}/${img}`)}`,
    [serverUrl, doc.Title, doc.id]
  );

  const ImgSetImages: string[] = useMemo(
    () => ImgSetImagesQuery.data ?? [],
    [ImgSetImagesQuery.data]
  );

  if (!doc.Title) return <></>;

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
        className="mx-auto space-y-5 bg-input/30 min-h-96 rounded overflow-hidden"
      >
        {ImgSetImages.map((img) => (
          <button
            disabled={!coverSelectMode}
            className={
              "w-full " +
              (coverSelectMode ? "p-1 border-2 border-foreground my-1" : "")
            }
            onClick={() => onImgClick(img)}
          >
            <img className="w-full" src={getImgURL(img)} />
          </button>
        ))}
      </div>
      <Button
        onClick={() => setCoverSelectMode((old) => !old)}
        variant="secondary"
        size="icon"
        className={
          "fixed bottom-8 right-8 p-2 scale-150 backdrop-blur-xs border-2 " +
          (coverSelectMode ? "!border-foreground" : "")
        }
      >
        <Image size={"3rem"} />
      </Button>
    </>
  );
}
