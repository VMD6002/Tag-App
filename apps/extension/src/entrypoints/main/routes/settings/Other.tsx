import { useAtom, useAtomValue } from "jotai";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { appModeAtom, galleryListWidthAtom } from "../../atoms/settings";

export default function Other() {
  const [galleryListWidth, setGalleryListWidth] = useAtom(galleryListWidthAtom);

  const appMode = useAtomValue(appModeAtom);
  if (appMode !== "hybrid") {
    return null;
  }

  return (
    <section className="max-w-xs w-full">
      <h3 className="text-xl mb-3">ImgSet</h3>
      <Label className="text-sm mb-1">Width {galleryListWidth}%</Label>
      <Slider
        value={[Number(galleryListWidth)]}
        onValueChange={(o) => setGalleryListWidth(o[0])}
        max={100}
        step={1}
      />
    </section>
  );
}
