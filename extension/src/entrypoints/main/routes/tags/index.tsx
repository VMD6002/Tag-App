import TitleHeader from "@/components/craft/TitleHeader";
import ParentTagsSection from "./components/ParentTagsSection";
import TagsSection from "./components/TagsSection";
import ServerAffix from "./components/ServerAffix";

export default function TagPage() {
  const { serverFeatures } = useSettingsData();
  return (
    <>
      <TitleHeader Title="Tags" />
      <ParentTagsSection />
      <TagsSection />
      {serverFeatures ? <ServerAffix /> : <></>}
    </>
  );
}
