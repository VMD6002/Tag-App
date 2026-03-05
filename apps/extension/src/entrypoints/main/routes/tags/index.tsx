import TitleHeader from "@/components/craft/TitleHeader";
import ParentTagsSection from "./components/ParentTagsSection";
import TagsSection from "./components/TagsSection";
import ServerAffix from "./components/ServerAffix";
import TagCoverModal from "./components/TagCoverModal";
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
      <ServerAffix />
    </>
  );
}
