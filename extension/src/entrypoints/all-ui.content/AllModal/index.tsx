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
import useData from "./useData";
import { Redo2 } from "lucide-react";

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

  const Data = useData();

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      Data.setTitle(e.target.value);
    },
    [] // dependency on sanitizeFilename
  );

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
    if (Identifier in contentData) {
      log("Already Exists returning");
      const mediaData = contentData[Identifier];
      Data.setTitle(mediaData.Title);
      const SiteTag = `Site:${Site}`;
      Data.setTags([
        ...mediaData.Tags.map((o) =>
          o !== SiteTag
            ? { label: o, value: o }
            : { label: o, value: o, fixed: true }
        ),
      ]);
      Data.setCoverUrl(mediaData.CoverUrl!);
      Data.setExtraData(mediaData.extraData || "");
      Data.setPreset(JSON.stringify(mediaData.Download?.flags));
      setExists(true);
    } else {
      Data.setTitle(sanitizeTextForFileName(Title));
      const SiteTag = `Site:${Site}`;
      Data.setTags([
        { label: SiteTag, value: SiteTag, fixed: true },
        ...defaultTags.map((o) => ({ label: o, value: o })),
      ]);
      Data.setCoverUrl(CoverUrl);
      Data.setExtraData(`Web: [${Url}](${Url})`);
      Data.setPreset(
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
    const sanitizedVideoTitle = sanitizeTextForFileName(Data.title);
    if (!sanitizedVideoTitle) {
      alert("Title must not be blank");
      Data.setTitle("");
      return;
    }
    const { Identifier, Site, Url, CoverUrl, Downloader } =
      GetDetailsFromPage();
    const SiteTag = `Site:${Site}`;
    const Time = Math.floor(Date.now() / 1000);
    if (CoverUrl !== Data.coverUrl)
      Data.setTags((o) => [
        ...o,
        { label: "Util:Different_Cover", value: "Util:Different_Cover" },
      ]);

    // @ts-ignore
    setContentData((oldVids: ContentDataType) => {
      if (Identifier in oldVids) {
        log("Already Exists returning");
        setExists(true);
        setOpenModal(false);
        return;
      }

      // @ts-ignore
      setTags((oldTags: TagType) => {
        if (!oldTags[SiteTag]) oldTags[SiteTag] = { Count: 1 };
        else oldTags[SiteTag].Count = oldTags[SiteTag].Count + 1;
        Data.tags.map((tag) => {
          oldTags[tag.value].Count++;
        });
        return oldTags;
      });

      oldVids[Identifier] = {
        id: Identifier,
        Title: sanitizedVideoTitle,
        CoverUrl: Data.coverUrl,
        // @ts-ignore
        Tags: [
          ...new Set([
            ...Data.tags.map((o) => o.value),
            CoverUrl !== Data.coverUrl ? "Util:Different_Cover" : null,
          ]),
        ].filter((o) => o),
        Url: Url,
        Added: Time,
        LastUpdated: Time,
        extraData: Data.extraData,
        Download: {
          type: Downloader,
          flags: JSON.parse(Data.preset),
        },
      };
      return oldVids;
    });
    Data.setTitle(sanitizedVideoTitle);
    setExists(true);
    setOpenModal(false);
  }, [Data]);

  const updateContentFunc = useCallback(() => {
    const sanitizedVideoTitle = sanitizeTextForFileName(Data.title);
    if (!sanitizeTextForFileName) {
      alert("Title must not be blank");
      Data.setTitle("");
      return;
    }
    const { Identifier, Downloader } = GetDetailsFromPage();

    // @ts-ignore
    setContentData((oldContent: ContentDataType) => {
      const updatedTags = Data.tags.map((o) => o.value);
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
      oldContent[Identifier].CoverUrl = Data.coverUrl;
      oldContent[Identifier].Tags = Data.tags.map((o) => o.value);
      oldContent[Identifier].extraData = Data.extraData;
      oldContent[Identifier].LastUpdated = Math.floor(Date.now() / 1000);
      oldContent[Identifier].Download = {
        type: Downloader,
        flags: JSON.parse(Data.preset),
      };
      return oldContent;
    });
    Data.setTitle(sanitizedVideoTitle);
    setExists(true);
    setOpenModal(false);
  }, [Data]);

  const removeContent = useCallback(() => {
    if (!confirm("Confirm Deletion")) return;
    const { Identifier, Title } = GetDetailsFromPage();
    removeContents([Identifier]);
    setExists(false);
    Data.setTags([]);
    Data.setTitle(Title);
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
            <div className="flex justify-between mb-1 items-center">
              <Label>Name</Label>
              <Button
                onClick={Data.resetTitle}
                size="icon"
                variant="outline"
                className="scale-80"
              >
                <Redo2 />
              </Button>
            </div>
            <Input
              maxLength={100}
              value={Data.title}
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
              value={Data.tags}
              onChange={Data.setTags}
            />
            <SeeMore>
              <PresetsMenu
                presets={presets}
                selectedPreset={Data.preset}
                setSelectedPreset={Data.setPreset}
              />
              <div className="flex justify-between mb-1 items-center">
                <Label>Cover Url</Label>
                <Button
                  onClick={Data.resetCoverUrl}
                  size="icon"
                  variant="outline"
                  className="scale-80"
                >
                  <Redo2 />
                </Button>
              </div>
              <Input
                value={Data.coverUrl}
                onChange={(e) => Data.setCoverUrl(e.target.value)}
                placeholder="Name"
                className="mb-4"
              />
              <div className="flex justify-between mb-1 items-center">
                <Label>Extra Data</Label>
                <Button
                  onClick={Data.resetExtraData}
                  size="icon"
                  variant="outline"
                  className="scale-80"
                >
                  <Redo2 />
                </Button>
              </div>
              <CodeEditor
                value={Data.extraData}
                language="md"
                placeholder="Extra data."
                onChange={(e) => Data.setExtraData(e.target.value)}
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
