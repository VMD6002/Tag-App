import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CodeEditor from "@uiw/react-textarea-code-editor";
import MultipleSelector from "@/components/ui/multiple-selector";
import PresetsMenu from "./PresetsMenu";
import SeeMore from "@/components/craft/SeeMore";
import { useTheme } from "@/components/theme-provider";
import { Redo2 } from "lucide-react";
import { useMainContext } from "./Main.Context";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { tagsAtom as globalTagsAtom } from "@/entrypoints/main/atoms/tags";
import {
  existsAtom,
  titleAtom,
  tagsAtom,
  coverAtom,
  extraDataAtom,
  resetTitleAtom,
  resetCoverAtom,
  resetExtraDataAtom,
  openModalAtom,
} from "./atom";

export default function ContentModal() {
  const { theme } = useTheme();

  const { addContentFunc, updateContentFunc } = useMainContext();
  const [openModal, setOpenModal] = useAtom(openModalAtom);

  const exists = useAtomValue(existsAtom);
  const [title, setTitle] = useAtom(titleAtom);
  const [tags, setTags] = useAtom(tagsAtom);
  const [cover, setCover] = useAtom(coverAtom);
  const [extraData, setExtraData] = useAtom(extraDataAtom);

  const resetTitle = useSetAtom(resetTitleAtom);
  const resetCover = useSetAtom(resetCoverAtom);
  const resetExtraData = useSetAtom(resetExtraDataAtom);

  const globalTags = useAtomValue(globalTagsAtom);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
    },
    [setTitle],
  );

  if (!openModal) return <></>;

  return (
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
            onClick={resetTitle}
            size="icon"
            variant="outline"
            className="scale-80"
          >
            <Redo2 />
          </Button>
        </div>
        <Input
          maxLength={100}
          value={title}
          onChange={handleNameChange}
          placeholder="Name"
          className="mb-4"
        />
        <Label className="mb-2">Tags</Label>
        <MultipleSelector
          options={Object.keys(globalTags).map((o) => ({
            label: o,
            value: o,
          }))}
          className="mb-4"
          placeholder="Tags"
          value={tags}
          onChange={setTags}
        />
        <SeeMore>
          <PresetsMenu />
          <div className="flex justify-between mb-1 items-center">
            <Label>Cover Url</Label>
            <Button
              onClick={resetCover}
              size="icon"
              variant="outline"
              className="scale-80"
            >
              <Redo2 />
            </Button>
          </div>
          <Input
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            placeholder="Name"
            className="mb-4"
          />
          <div className="flex justify-between mb-1 items-center">
            <Label>Extra Data</Label>
            <Button
              onClick={resetExtraData}
              size="icon"
              variant="outline"
              className="scale-80"
            >
              <Redo2 />
            </Button>
          </div>
          <div className="max-h-28 overflow-y-scroll mb-4">
            <CodeEditor
              value={extraData}
              language="md"
              placeholder="Extra data."
              onChange={(e) => setExtraData(e.target.value)}
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
          <Button onClick={addContentFunc} className="max-w-sm w-11/12 mx-auto">
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
  );
}
