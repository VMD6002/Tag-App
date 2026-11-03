import TitleHeader from "@/components/craft/TitleHeader";
import ParentTagsSection from "./components/ParentTagsSection";
import TagCoverModal from "./components/TagCoverModal";
import TagsSection from "./components/TagsSection";
import { RemoteTagContextProvider } from "./Remote.Tags.Context";

export default function TagPage() {
  return (
    <>
      <TitleHeader Title="Remote Tags" />
      <RemoteTagContextProvider>
        <ParentTagsSection />
        <TagCoverModal />
        <TagsSection />
      </RemoteTagContextProvider>
    </>
  );
}
