import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import getImgURL from "../getImgURL";
import { useDeferredValue } from "react";
import { useTagContext } from "../Tags.Context";
import type { TagContext } from "../Tags.Context";

export default function TagCoverModal() {
  const {
    portAndIP,
    cover,
    toggleModal,
    setCover,
    setTagCover,
    open,
    removeCover,
  } = useTagContext() as TagContext;

  const differedCoverValue = useDeferredValue(cover);
  const coverURL = useMemo(() => {
    const url = getImgURL(differedCoverValue, portAndIP[0], portAndIP[1]);
    console.log(url);
    return url;
  }, [differedCoverValue, portAndIP]);

  if (!open) return <></>;

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
        <div className="w-11/12 bg-input/50 overflow-hidden rounded-sm border-2 mx-auto mb-3">
          <img
            className="object-contain m-auto max-h-[max(16rem,55vh)] w-full min-h-64"
            src={coverURL}
          />
        </div>
        <Input
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          className="mb-3"
          type="text"
        />
        <div className="mx-auto flex gap-2">
          <Button onClick={setTagCover}>Set</Button>
          <Button variant="destructive" onClick={removeCover}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
