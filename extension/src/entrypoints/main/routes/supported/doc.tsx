import TitleHeader from "@/components/craft/TitleHeader";
import Markdown from "react-markdown";
import ScriptingGuidMD from "../../../../../Scripting Guid.md";

export default function ScriptingGuid() {
  const { theme } = useTheme();
  return (
    <>
      <TitleHeader Title="Scripting Guide" />
      <div
        className={
          "max-w-[80ch] w-11/12 mx-auto prose " +
          (theme == "dark" || theme == "system" ? "prose-invert" : "")
        }
      >
        <Markdown>{ScriptingGuidMD.body}</Markdown>
      </div>
    </>
  );
}
