import TitleHeader from "@/components/craft/TitleHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useSupportedSites from "@/hooks/useSupportedSites";
import saveJsonFile from "@/lib/saveJsonFile";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Pencil, Trash } from "lucide-react";
import z from "zod";

const presetSchema = z.object({
  label: z.string(),
  value: z.string(),
  cookies: z.literal(true).optional(),
});
const SiteDataSchema = z.object({
  Name: z.string(),
  Hosts: z.array(z.string()).min(1),
  Script: z.string().optional(),
  BegonEvalErrors: z.literal(true).optional(),
  matchPatterns: z.array(z.string()).optional(),
  Cookies: z.literal(true).optional(),
  Download: z
    .object({
      presets: z.array(presetSchema),
      defaultPreset: presetSchema,
    })
    .optional(),
});

export type SiteData = z.infer<typeof SiteDataSchema>;

const SiteDataScaffold: SiteData = {
  Name: "SiteName",
  Hosts: ["www.SiteName.com"],
  matchPatterns: ["/*"],
  Download: {
    presets: [
      {
        label: "None",
        value: "",
      },
    ],
    defaultPreset: {
      label: "None",
      value: "",
    },
  },
};

const defaultSiteScript = `// ContentData.Downloader = "curl"; Uncomment for Images
// ContentData.OgImage = "curl"; Uncomment for Images
ContentData.Title = document.title;
ContentData.Url = location.href;
ContentData.Identifier = \`someSite_\${SomeID}\`;
ContentData.CoverUrl = scriptData.GetOgImage();
scriptData.ready = true;`;

const DefaultSiteDataString = JSON.stringify(SiteDataScaffold, null, 2);

export default function Supported() {
  const { theme } = useTheme();
  const [siteDataEditorOpen, setSiteDataEditorOpen] = useState(false);
  const [siteData, setSiteData] = useState<string>(DefaultSiteDataString);
  const [siteScript, setSiteScript] = useState<string>(defaultSiteScript);

  const toggleSiteDataEditor = useCallback(
    () => setSiteDataEditorOpen((old) => !old),
    []
  );

  const addSite = useCallback(() => {
    setSiteData(DefaultSiteDataString);
    setSiteScript(defaultSiteScript);
    setSiteDataEditorOpen(true);
  }, []);

  const {
    supportedSites,
    setSupportedSites,
    refreshSupportedHostsIndex,
    addSupportedHostsToIndex,
  } = useSupportedSites();

  const addOrUpdateScript = useCallback(() => {
    try {
      const tmp: SiteData = JSON.parse(siteData);
      tmp.Script = siteScript;
      const data = SiteDataSchema.parse(tmp);
      setSupportedSites((old) => {
        old![data.Name] = data;
        return { ...old };
      });
      addSupportedHostsToIndex(data.Name, data.Hosts);
      setSiteDataEditorOpen(false);
      alert("Script Updated Succlessfully");
    } catch (error: any) {
      alert(error?.message ?? "");
    }
  }, [siteData, siteScript]);

  const setCurrentSiteData = useCallback((SiteData: SiteData) => {
    try {
      setSiteScript(SiteData.Script!);
      const Temp = { ...SiteData };
      delete Temp.Script;
      const JsonString = JSON.stringify(Temp, null, 2);
      setSiteData(JsonString);
      setSiteDataEditorOpen(true);
    } catch (error) {
      console.error("Error during minification:", error);
    }
  }, []);

  const exportSiteList = useCallback(() => {
    saveJsonFile(supportedSites, "TagAppExt Site List");
  }, [supportedSites]);

  const fileInputRef = useRef(null);
  const handleFileClick = useCallback(() => {
    // @ts-ignore
    fileInputRef.current?.click();
  }, []);
  const importSiteList = useCallback((event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    file
      .text()
      .then((text: string) => JSON.parse(text))
      .then((data: Record<string, SiteData>) => {
        // @ts-ignore
        setSupportedSites((old) => {
          const tmp = { ...old };
          for (const site in data) {
            const siteData = SiteDataSchema.safeParse(data[site]);
            if (!siteData.success) {
              alert(siteData.error.message);
              continue;
            }
            tmp[siteData.data.Name] = siteData.data;
          }
          return tmp;
        });
      })
      .catch((error: any) => {
        console.error("Error reading or parsing the JSON file:", error);
      });
  }, []);

  const removeSite = useCallback((SiteName: string) => {
    setSiteDataEditorOpen(false);
    if (confirm(`U sure u want remove ${SiteName}`))
      // @ts-ignore
      setSupportedSites((old) => {
        // @ts-ignore
        delete old[SiteName];
        return { ...old };
      });
  }, []);

  return (
    <>
      <TitleHeader Title="Suported Sites" />
      <div className="flex w-full justify-center gap-2 mb-2">
        <div className="flex items-center">
          <Button variant="secondary" onClick={handleFileClick}>
            Import
          </Button>
          <input
            className="w-full h-full hidden"
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={importSiteList}
          />
        </div>
        {siteDataEditorOpen ? (
          <Button onClick={toggleSiteDataEditor}>Close</Button>
        ) : (
          <Button onClick={addSite}>Add</Button>
        )}
        <Button variant="secondary" onClick={exportSiteList}>
          Export
        </Button>
      </div>
      <Button
        variant="secondary"
        className="mx-auto grid mb-10 text-xs"
        size="sm"
        onClick={refreshSupportedHostsIndex}
      >
        Force Refresh Index
      </Button>
      {siteDataEditorOpen ? (
        <>
          <Button
            onClick={addOrUpdateScript}
            className="w-full mb-4"
            variant="outline"
          >
            Save Site Data and Script
          </Button>
          <div className="grid gap-3 mb-10">
            <div>
              <Label className="mb-4 text-lg">Site Data</Label>
              <div className="max-h-96 overflow-y-auto!">
                <CodeEditor
                  minHeight={200}
                  value={siteData}
                  language="json"
                  placeholder="Site Data"
                  onChange={(evn) => setSiteData(evn.target.value)}
                  padding={15}
                  className="text-sm! h-fit"
                  style={{
                    fontFamily:
                      "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                  }}
                  data-color-mode={theme === "system" ? "dark" : theme}
                />
              </div>
            </div>
            <div>
              <Label className="mb-4 text-lg">Site Script</Label>
              <div className="max-h-96 overflow-y-auto!">
                <CodeEditor
                  value={siteScript}
                  language="js"
                  placeholder="Site Data"
                  onChange={(evn) => setSiteScript(evn.target.value)}
                  padding={15}
                  className="text-sm! h-fit"
                  style={{
                    fontFamily:
                      "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                  }}
                  data-color-mode={theme === "system" ? "dark" : theme}
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
      <div className="grid min-[540px]:grid-cols-2 gap-x-6 gap-y-10 w-fit mx-auto">
        {Object.keys(supportedSites)
          .sort()
          .map((Site, siteIndex) => (
            <div key={`Section-${Site}`}>
              <div className="flex justify-between w-full gap-3 mb-4 items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentSiteData(supportedSites[Site])}
                >
                  <Pencil className="mb-0.5" />
                </Button>
                <div className="flex w-full items-center">
                  <h1 className="text-2xl mr-2">{siteIndex + 1}.</h1>
                  <img
                    className="h-full aspect-square w-6 rounded bg-muted"
                    src={`https://www.google.com/s2/favicons?sz=64&domain=${supportedSites[Site].Hosts[0]}`}
                  />
                  <h1 className="text-2xl ml-2 font-stretch-condensed">
                    {Site}
                  </h1>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeSite(Site)}
                >
                  <Trash className="mb-0.5" />
                </Button>
              </div>
              <ul className="list-decimal ml-8 grid gap-y-1 text-base font-mono font-stretch-ultra-condensed">
                {supportedSites[Site].Hosts.map((host) => (
                  <li key={`Site-Link-${Site}-${host}`}>
                    <a
                      className="block break-all underline underline-offset-1"
                      href={"https://" + host}
                      target="_blank"
                    >
                      {host}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </>
  );
}
