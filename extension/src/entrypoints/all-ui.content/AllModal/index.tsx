import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CodeEditor from "@uiw/react-textarea-code-editor";
import MultipleSelector from "@/components/ui/multiple-selector";
import GetDetailsFromPage from "@/lib/GetDetailsFromPage";
import GetTagAppSiteData from "@/lib/GetTagAppSiteData";
import TIMEOUTS from "@/lib/TIMEOUTS";
import FloatingButtons from "./FloatingButtons";
import PresetsMenu from "./PresetsMenu";
import SeeMore from "../../../components/craft/SeeMore";
import log from "@/lib/log";

function sanitizeTextForFileName(value: string) {
  // Remove invalid characters
  value = value.trim();
  value = value.replace(/[^a-zA-Z0-9._\- ]/g, "_");
  // Limit length
  if (value.length > 100) {
    value = value.slice(0, 100);
    value = value.trim();
  }
  return value;
}

function ToBeLoaded() {
  const [load, setLoad] = useState(true);

  const count = useRef(0);
  const [exists, setExists] = useState<boolean>(false);

  const [presets, setPresets] = useState<MultiSelectOption[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const [videoTitle, setVideoTitle] = useState("");
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVideoTitle(e.target.value);
    },
    [] // dependency on sanitizeFilename
  );
  const [selectedTags, setSelectedTags] = useState<MultiSelectOption[]>([]);

  const [videoCoverUrl, setVideoCoverUrl] = useState("");
  const [videoExtraData, setVideoExtraData] = useState("");

  const { contentData, setContentData, removeContents } = useContentData();
  const { tags, setTags } = useTagData();

  const [openModal, setOpenModal] = useState(false);

  const checkExistance = useCallback(() => {
    setExists(false);
    const { Identifier, Title, defaultTags, CoverUrl, Site, Url, OgImage } =
      GetDetailsFromPage();
    if (!Identifier && count.current < 20) {
      count.current++;
      log(count.current + ":" + " Existance");
      TIMEOUTS.clearAllTimeouts();
      TIMEOUTS.setTimeout(() => checkExistance(), 500);
      return;
    }
    if (!Identifier) {
      TIMEOUTS.clearAllTimeouts();
      log("Count finished, Doesnt Exist");
      return;
    }
    const { Download } = GetTagAppSiteData();
    if (contentData.hasOwnProperty(Identifier)) {
      log("Already Exists returning");
      const Data = contentData[Identifier];
      setVideoTitle(Data.Title);
      const SiteTag = `Site:${Site}`;
      setSelectedTags([
        ...Data.Tags.map((o) =>
          o !== SiteTag
            ? { label: o, value: o }
            : { label: o, value: o, fixed: true }
        ),
      ]);
      setVideoCoverUrl(Data.CoverUrl!);
      setVideoExtraData(Data.extraData || "");
      setSelectedPreset(JSON.stringify(Data.Download?.flags));
      setExists(true);
    } else {
      setVideoTitle(sanitizeTextForFileName(Title));
      const SiteTag = `Site:${Site}`;
      setSelectedTags([
        ...defaultTags.map((o) => ({ label: o, value: o })),
        { label: SiteTag, value: SiteTag, fixed: true },
      ]);
      setVideoCoverUrl(CoverUrl);
      setVideoExtraData(`Web: [${Url}](${Url})`);
      setSelectedPreset(
        OgImage
          ? `"${OgImage}"`
          : JSON.stringify(Download?.defaultPreset) ?? `""`
      );
      setExists(false);
    }
    setPresets(Download?.presets ?? []);

    setLoad(true);
  }, [contentData]);

  const addContentFunc = useCallback(() => {
    const sanitizedVideoTitle = sanitizeTextForFileName(videoTitle);
    if (!sanitizedVideoTitle) {
      alert("Title must not be blank");
      setVideoTitle("");
      return;
    }
    const { Identifier, Site, Url, CoverUrl, Downloader } =
      GetDetailsFromPage();
    const SiteTag = `Site:${Site}`;
    const Time = Math.floor(Date.now() / 1000);
    if (CoverUrl !== videoCoverUrl)
      setSelectedTags((o) => [
        ...o,
        { label: "Util:Different_Cover", value: "Util:Different_Cover" },
      ]);

    // @ts-ignore
    setContentData((oldVids: ContentDataType) => {
      if (oldVids.hasOwnProperty(Identifier)) {
        log("Already Exists returning");
        setExists(true);
        setOpenModal(false);
        return;
      }

      // @ts-ignore
      setTags((oldTags: TagType) => {
        if (!oldTags[SiteTag]) oldTags[SiteTag] = { Count: 1 };
        else oldTags[SiteTag].Count = oldTags[SiteTag].Count + 1;
        selectedTags.map((tag) => {
          oldTags[tag.value].Count++;
        });
        return oldTags;
      });

      oldVids[Identifier] = {
        id: Identifier,
        Title: sanitizedVideoTitle,
        CoverUrl: videoCoverUrl,
        // @ts-ignore
        Tags: [
          ...new Set([
            ...selectedTags.map((o) => o.value),
            CoverUrl !== videoCoverUrl ? "Util:Different_Cover" : null,
          ]),
        ].filter((o) => o),
        Url: Url,
        Added: Time,
        LastUpdated: Time,
        extraData: videoExtraData,
        Download: {
          type: Downloader,
          flags: JSON.parse(selectedPreset),
        },
      };
      return oldVids;
    });
    setVideoTitle(sanitizedVideoTitle);
    setExists(true);
    setOpenModal(false);
  }, [selectedTags, videoTitle, videoCoverUrl, videoExtraData, selectedPreset]);

  const updateContentFunc = useCallback(() => {
    const sanitizedVideoTitle = sanitizeTextForFileName(videoTitle);
    if (!sanitizeTextForFileName) {
      alert("Title must not be blank");
      setVideoTitle("");
      return;
    }
    const { Identifier, Downloader } = GetDetailsFromPage();

    // @ts-ignore
    setContentData((oldContent: ContentDataType) => {
      const updatedTags = selectedTags.map((o) => o.value);
      // @ts-ignore
      setTags((oldTags: TagType) => {
        const Deleted = oldContent[Identifier].Tags.filter(
          (a) => !updatedTags.includes(a)
        );
        Deleted.map((tag) => {
          oldTags[tag].Count--;
        });

        const Added = updatedTags.filter(
          (a) => !oldContent[Identifier].Tags.includes(a)
        );
        Added.map((tag) => {
          oldTags[tag].Count++;
        });
        return oldTags;
      });

      oldContent[Identifier].Title = sanitizedVideoTitle;
      oldContent[Identifier].CoverUrl = videoCoverUrl;
      oldContent[Identifier].Tags = selectedTags.map((o) => o.value);
      oldContent[Identifier].extraData = videoExtraData;
      oldContent[Identifier].LastUpdated = Math.floor(Date.now() / 1000);
      oldContent[Identifier].Download = {
        type: Downloader,
        flags: JSON.parse(selectedPreset),
      };
      return oldContent;
    });
    setVideoTitle(sanitizedVideoTitle);
    setExists(true);
    setOpenModal(false);
  }, [selectedTags, videoTitle, videoCoverUrl, videoExtraData, selectedPreset]);

  const removeContent = useCallback(() => {
    if (!confirm("Confirm Deletion")) return;
    const { Identifier, Title } = GetDetailsFromPage();
    removeContents([Identifier]);
    setExists(false);
    setSelectedTags([]);
    setVideoTitle(Title);
  }, []);

  const toggleModalFunc = useCallback(() => {
    setOpenModal((old) => !old);
  }, []);

  useEffect(() => {
    setLoad(false);
    checkExistance();
  }, [contentData]);

  return (
    <>
      <form
        style={{ display: "none" }}
        onSubmit={(e) => {
          e.preventDefault();
          count.current = 0;
          checkExistance();
        }}
      >
        <input id="loadAndRefresh" type="submit" />
      </form>
      <form
        style={{ display: "none" }}
        onSubmit={(e) => {
          e.preventDefault();
          setLoad(false);
        }}
      >
        <input id="remove" type="submit" />
      </form>
      {openModal ? (
        <div
          style={{ zIndex: 2147483647 }}
          className="grid fixed h-screen w-full place-items-center"
        >
          <div
            onClick={toggleModalFunc}
            className="h-screen absolute w-full bg-black/10 backdrop-blur-xs"
          />
          <div className="max-w-md absolute w-full grid bg-secondary rounded shadow px-8 py-10">
            <Label className="mb-2">Name</Label>
            <Input
              maxLength={100}
              value={videoTitle}
              onChange={handleNameChange}
              placeholder="Name"
              className="mb-4"
            />
            <Label className="mb-2">Tags</Label>
            <MultipleSelector
              options={Object.keys(tags).map((o) => ({
                label: o,
                value: o,
              }))}
              className="mb-4"
              placeholder="Tags"
              value={selectedTags}
              onChange={setSelectedTags}
            />
            <SeeMore>
              <PresetsMenu
                presets={presets}
                selectedPreset={selectedPreset}
                setSelectedPreset={setSelectedPreset}
              />
              <Label className="mb-2">Cover Url</Label>
              <Input
                value={videoCoverUrl}
                onChange={(e) => setVideoCoverUrl(e.target.value)}
                placeholder="Name"
                className="mb-4"
              />
              <Label className="mb-2">Extra Data</Label>
              <CodeEditor
                value={videoExtraData}
                language="md"
                placeholder="Extra data."
                onChange={(e) => setVideoExtraData(e.target.value)}
                padding={15}
                className="bg-background/80! mb-4"
                style={{
                  fontFamily:
                    "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                }}
                data-color-mode="light"
              />
            </SeeMore>

            {!exists ? (
              <Button
                onClick={addContentFunc}
                className="max-w-sm w-11/12 mx-auto"
              >
                Add To Library
              </Button>
            ) : (
              <Button
                onClick={updateContentFunc}
                className="max-w-sm w-11/12 mx-auto"
              >
                Update
              </Button>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
      <FloatingButtons
        exists={exists}
        openModal={openModal}
        removeContent={removeContent}
        toggleModalFunc={toggleModalFunc}
        load={load}
      />
    </>
  );
}

export default function App() {
  const [Load, setLoad] = useState<boolean>(false);

  if (!Load)
    return (
      <>
        <form
          style={{ display: "none" }}
          onSubmit={(e) => {
            e.preventDefault();
            setLoad(true);
          }}
        >
          <input id="loadAndRefresh" type="submit" />
        </form>
        <form
          style={{ display: "none" }}
          onSubmit={(e) => {
            e.preventDefault();
            setLoad(false);
          }}
        >
          <input id="remove" type="submit" />
        </form>
      </>
    );
  return <ToBeLoaded />;
}
