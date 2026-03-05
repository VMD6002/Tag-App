import { useCallback, useRef, useState, useEffect } from "react";
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
import { sanitizeStringForFileName } from "@tagapp/utils";
import { useAtom, useSetAtom } from "jotai";
import {
  tagsAtom,
  contentDataAtom,
  removeContentsAtom,
} from "@/entrypoints/main/atoms/core";
import { useTheme } from "@/components/theme-provider";
import { Redo2 } from "lucide-react";

export default function MainContent() {
  const { theme } = useTheme();
  const [load, setLoad] = useState(true);

  const count = useRef(0);
  const [exists, setExists] = useState<boolean>(false);
  const [presets, setPresets] = useState<any[]>([]);

  const Data = useData();

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      Data.setTitle(e.target.value);
    },
    [],
  );

  const removeContents = useSetAtom(removeContentsAtom);
  const [contentData, setContentData] = useAtom(contentDataAtom);
  const [tags, setTags] = useAtom(tagsAtom);

  const [openModal, setOpenModal] = useState(false);

  const checkExistance = useCallback(() => {
    setExists(false);
    const {
      identifier,
      title,
      extraData,
      defaultTags,
      coverUrl,
      site,
      url,
      ogImage,
    } = GetDetailsFromPage();
    if (!identifier && count.current < 20) {
      count.current++;
      log(count.current + ":" + " Existance");
      TIMEOUTS.clearAllTimeouts();
      TIMEOUTS.setTimeout(() => checkExistance(), 500);
      return;
    }
    if (!identifier) {
      TIMEOUTS.clearAllTimeouts();
      log("Count finished, Doesnt Exist");
      return;
    }
    const { download } = GetTagAppSiteData();
    if (identifier in contentData) {
      log("Already Exists returning");
      const mediaData = contentData[identifier];
      Data.setTitle(mediaData.title);
      const SiteTag = `Site:${site}`;
      Data.setTags([
        ...mediaData.tags.map((o) =>
          o !== SiteTag
            ? { label: o, value: o }
            : { label: o, value: o, fixed: true },
        ),
      ]);
      Data.setCoverUrl(mediaData.coverUrl!);
      Data.setExtraData(mediaData.extraData || "");
      Data.setPreset(JSON.stringify(mediaData.download?.flags));
      setExists(true);
    } else {
      Data.setTitle(sanitizeStringForFileName(title));
      const SiteTag = `Site:${site}`;
      Data.setTags([
        { label: SiteTag, value: SiteTag, fixed: true },
        ...defaultTags.map((o) => ({ label: o, value: o })),
      ]);
      Data.setCoverUrl(coverUrl);
      Data.setExtraData(
        `Web: [${url}](${url})${extraData ? "\n" + extraData : ""}`,
      );
      Data.setPreset(
        ogImage
          ? `"${ogImage}"`
          : (JSON.stringify(download?.defaultPreset) ?? `""`),
      );
      setExists(false);
    }
    setPresets(download?.presets ?? []);

    setLoad(true);
  }, [contentData]);

  const addContentFunc = useCallback(() => {
    const sanitizedVideoTitle = sanitizeStringForFileName(Data.title);
    if (!sanitizedVideoTitle) {
      alert("Title must not be blank");
      Data.setTitle("");
      return;
    }
    const { identifier, site, url, coverUrl, downloader } =
      GetDetailsFromPage();
    const SiteTag = `Site:${site}`;
    const Time = Math.floor(Date.now() / 1000);
    if (coverUrl !== Data.coverUrl)
      Data.setTags((o) => [
        ...o,
        { label: "Util:Different_Cover", value: "Util:Different_Cover" },
      ]);

    setContentData(async (tmp) => {
      const oldVids = await tmp;
      if (identifier in oldVids) {
        log("Already Exists returning");
        setExists(true);
        setOpenModal(false);
        return oldVids;
      }

      setTags(async (tmpp) => {
        const oldTags = await tmpp;
        if (!oldTags[SiteTag]) oldTags[SiteTag] = { Count: 1 };
        else oldTags[SiteTag].Count = oldTags[SiteTag].Count + 1;
        Data.tags.map((tag) => {
          oldTags[tag.value].Count++;
        });
        return oldTags;
      });

      oldVids[identifier] = {
        id: identifier,
        title: sanitizedVideoTitle,
        coverUrl: Data.coverUrl,
        tags: [
          ...new Set([
            ...Data.tags.map((o) => o.value),
            coverUrl !== Data.coverUrl ? "Util:Different_Cover" : null,
          ]),
        ].filter((o) => o) as string[],
        url: url,
        added: Time,
        lastUpdated: Time,
        extraData: Data.extraData,
        download: {
          type: downloader,
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
    const sanitizedVideoTitle = sanitizeStringForFileName(Data.title);
    if (!sanitizeStringForFileName) {
      alert("Title must not be blank");
      Data.setTitle("");
      return;
    }
    const { identifier, downloader } = GetDetailsFromPage();

    setContentData(async (tmp1) => {
      const oldContent = await tmp1;
      const updatedTags = Data.tags.map((o) => o.value);
      setTags(async (tmp2) => {
        const oldTags = await tmp2;
        const Deleted = oldContent[identifier].tags.filter(
          (a) => !updatedTags.includes(a),
        );
        Deleted.map((tag) => {
          oldTags[tag].Count--;
        });

        const Added = updatedTags.filter(
          (a) => !oldContent[identifier].tags.includes(a),
        );
        Added.map((tag) => {
          oldTags[tag].Count++;
        });
        return oldTags;
      });

      oldContent[identifier].title = sanitizedVideoTitle;
      oldContent[identifier].coverUrl = Data.coverUrl;
      oldContent[identifier].tags = Data.tags.map((o) => o.value);
      oldContent[identifier].extraData = Data.extraData;
      oldContent[identifier].lastUpdated = Math.floor(Date.now() / 1000);
      oldContent[identifier].download = {
        type: downloader,
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
    const { identifier, title } = GetDetailsFromPage();
    removeContents([identifier]);
    setExists(false);
    Data.setTags([]);
    Data.setTitle(title);
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
          className="grid fixed min-h-screen w-full place-items-center overflow-y-auto overflow-x-clip top-0"
        >
          <div
            onClick={() => setOpenModal(false)}
            className="h-screen absolute w-full bg-black/10 backdrop-blur-xs"
          />
          <div className="max-w-md absolute w-full grid text-foreground text-base font-sans bg-secondary rounded shadow px-8 py-10">
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
              <div className="max-h-28 overflow-y-scroll mb-4">
                <CodeEditor
                  value={Data.extraData}
                  language="md"
                  placeholder="Extra data."
                  onChange={(e) => Data.setExtraData(e.target.value)}
                  padding={15}
                  className="bg-background/80!"
                  style={{
                    fontFamily:
                      "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                  }}
                  data-color-mode={theme === "system" ? "dark" : theme}
                />
              </div>
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
        toggleModalFunc={() => setOpenModal(true)}
        load={load}
      />
    </>
  );
}
