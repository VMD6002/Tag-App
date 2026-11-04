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
      <TitleHeader Title="Tags" />
      <ParentTagsSection />
      <TagContextProvider>
        <TagCoverModal />
        <TagsSection />
      </TagContextProvider>
    </>
  );
}
