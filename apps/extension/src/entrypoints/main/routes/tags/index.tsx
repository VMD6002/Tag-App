import { useAtomValue } from "jotai";
import TitleHeader from "@/components/craft/TitleHeader";
import { contentDataAtom } from "@/entrypoints/main/atoms";
import ParentTagsSection from "./components/ParentTagsSection";
import TagCoverModal from "./components/TagCoverModal";
import TagsSection from "./components/TagsSection";
import { TagContextProvider } from "./Tags.Context";

export default function TagPage() {
  // Mounting keeps it subscribed to storage; remove/fix callbacks rewrite content.
  useAtomValue(contentDataAtom);
  return (
    <>
      <TitleHeader
        Title="Tags"
        description="Tags are grouped by the part before the colon. The number beside a tag is how many items use it."
      />
      <div className="grid grid-cols-1 gap-5 pb-10">
        <ParentTagsSection />
        <TagContextProvider>
          <TagCoverModal />
          <TagsSection />
        </TagContextProvider>
      </div>
    </>
  );
}
