import TitleHeader from "@/components/craft/TitleHeader";
import Markdown from "react-markdown";
import ScriptingGuidMD from "@/../../../Notes/Scripting Guid.md";

export default function ScriptingGuid() {
  return (
    <>
      <TitleHeader Title="Scripting Guide" />
      <div className="max-w-[80ch] w-11/12 mx-auto text-base typography ">
        <Markdown>{ScriptingGuidMD.body}</Markdown>
      </div>
    </>
  );
}
