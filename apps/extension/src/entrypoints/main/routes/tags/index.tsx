import TitleHeader from "@/components/craft/TitleHeader";
import ParentTagsSection from "./components/ParentTagsSection";
import TagCoverModal from "./components/TagCoverModal";
import TagsSection from "./components/TagsSection";
import { TagContextProvider } from "./Tags.Context";

export default function TagPage() {
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
