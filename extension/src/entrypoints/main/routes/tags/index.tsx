import TitleHeader from "@/components/craft/TitleHeader";
import ParentTagsSection from "./components/ParentTagsSection";
import TagsSection from "./components/TagsSection";
import ServerAffix from "./components/ServerAffix";
import TagCoverModal from "./components/TagCoverModal";
import { TagContextProvider } from "./Tags.Context";

export default function TagPage() {
  const { serverFeatures } = useSettingsData();
  return (
    <>
      <TitleHeader Title="Tags" />
      <ParentTagsSection />
      <TagContextProvider>
        <TagCoverModal />
        <TagsSection />
      </TagContextProvider>
      {serverFeatures ? <ServerAffix /> : <></>}
    </>
  );
}
