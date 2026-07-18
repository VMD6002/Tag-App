import { useState, useCallback, useRef } from "react";
import constate from "constate";
import z from "zod";
import { useAtom, useAtomValue } from "jotai";
import { PresetSchema } from "@tagapp/utils/types";
import {
  useAddSupportedHostsToIndex,
  useRefreshSupportedHostsIndex,
  supportedSitesAtom,
  supportedHostsIndexAtom,
} from "../../atoms/supportedSites";
import saveJsonFile from "@/lib/saveJsonFile";

// ─── Schema & Types ────────────────────────────────────────────────────────────

export const SiteDataSchema = z.object({
  name: z.string(),
  hosts: z.array(z.string()).min(1),
  script: z.string(),
  afterAddScript: z.string().optional(),
  afterRemoveScript: z.string().optional(),
  matchPatterns: z.array(z.string()).optional(),
  download: z
    .object({
      presets: z.array(PresetSchema),
      defaultPreset: PresetSchema,
    })
    .optional(),
});

export type SiteData = z.infer<typeof SiteDataSchema>;

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const defaultSiteScript = `ctdls.title = document.title
ctdls.url = location.href
ctdls.identifier = \`someSite_\${SomeID}\`
ctdls.cover = sh.getOgImage()
sh.ready = true`;

const SiteDataScaffold: Omit<SiteData, "script"> = {
  name: "SiteName",
  hosts: ["www.SiteName.com"],
  matchPatterns: ["/*"],
  download: {
    presets: [
      {
        label: "720p",
        value: "-f b[height<=720]",
      },
      {
        label: "480p",
        value: "-f b[height<=480]",
      },
      {
        label: "360p",
        value: "-f b[height<=360]",
      },
    ],
    defaultPreset: {
      label: "480p",
      value: "-f b[height<=480]",
    },
  },
};

export const DefaultSiteDataString = JSON.stringify(SiteDataScaffold, null, 2);

// ─── Hook ──────────────────────────────────────────────────────────────────────

function useSupportedSite() {
  // Editor UI state
  const [siteDataEditorOpen, setSiteDataEditorOpen] = useState(false);
  const [siteData, setSiteData] = useState<string>(DefaultSiteDataString);
  const [siteScript, setSiteScript] = useState<string>(defaultSiteScript);
  const [afterAddScript, setAfterAddScript] = useState<string>("");
  const [afterRemoveScript, setAfterRemoveScript] = useState<string>("");
  const [editingSiteName, setEditingSiteName] = useState<string | null>(null);

  // Jotai atoms
  const [supportedSites, setSupportedSites] = useAtom(supportedSitesAtom);
  const refreshSupportedHostsIndex = useRefreshSupportedHostsIndex();
  const supportedHostsIndex = useAtomValue(supportedHostsIndexAtom);
  const addSupportedHostsToIndex =
    useAddSupportedHostsToIndex(supportedHostsIndex);

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const addSite = useCallback(() => {
    setSiteData(DefaultSiteDataString);
    setSiteScript(defaultSiteScript);
    setSiteDataEditorOpen(true);
    setEditingSiteName(null);
  }, []);

  const saveScript = useCallback(() => {
    try {
      const tmp: SiteData = JSON.parse(siteData);
      tmp.script = siteScript.trim();
      tmp.afterAddScript = afterAddScript.trim() || undefined;
      tmp.afterRemoveScript = afterRemoveScript.trim() || undefined;
      const data = SiteDataSchema.parse(tmp);
      setSupportedSites(async (old) => {
        const New = { ...(await old) };
        if (editingSiteName && editingSiteName !== data.name) {
          delete New[editingSiteName];
        }
        New[data.name] = data;
        return New;
      });
      addSupportedHostsToIndex(data.name, data.hosts);
      setEditingSiteName(data.name);
      alert("Script Updated Successfully");
    } catch (error: any) {
      alert(error?.message ?? "");
    }
  }, [
    siteData,
    siteScript,
    editingSiteName,
    afterAddScript,
    afterRemoveScript,
  ]);

  const selectSite = useCallback((site: SiteData) => {
    try {
      const { script, afterAddScript, afterRemoveScript, ...otherSiteData } =
        site;
      setSiteScript(script);
      setAfterAddScript(afterAddScript ?? "");
      setAfterRemoveScript(afterRemoveScript ?? "");
      setSiteData(JSON.stringify(otherSiteData, null, 2));
      setSiteDataEditorOpen(true);
      setEditingSiteName(site.name);
    } catch (error) {
      console.error("Error loading site data:", error);
    }
  }, []);

  const removeSite = useCallback(
    (siteName: string) => {
      if (confirm(`Are you sure you want to remove ${siteName}?`)) {
        setSupportedSites(async (old) => {
          const New = { ...(await old) };
          delete New[siteName];
          return New;
        });
        if (editingSiteName === siteName) {
          setSiteDataEditorOpen(false);
          setEditingSiteName(null);
        }
      }
    },
    [editingSiteName],
  );

  const closeEditor = useCallback(() => {
    setSiteDataEditorOpen(false);
    setEditingSiteName(null);
  }, []);

  const exportSiteList = useCallback(() => {
    saveJsonFile(supportedSites, "TagAppExt Site List");
  }, [supportedSites]);

  const importSiteList = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      file
        .text()
        .then((text) => JSON.parse(text))
        .then((data: Record<string, SiteData>) => {
          setSupportedSites(async (old) => {
            const New = { ...(await old) };
            for (const site in data) {
              const parsed = SiteDataSchema.safeParse(data[site]);
              if (!parsed.success) {
                alert(z.prettifyError(parsed.error));
                continue;
              }
              New[parsed.data.name] = parsed.data;
            }
            refreshSupportedHostsIndex(New);
            return New;
          });
        })
        .catch((error: any) => {
          console.error("Error reading or parsing the JSON file:", error);
        });
    },
    [],
  );

  return {
    // State
    siteDataEditorOpen,
    siteData,
    setSiteData,
    siteScript,
    setSiteScript,
    afterAddScript,
    setAfterAddScript,
    afterRemoveScript,
    setAfterRemoveScript,
    editingSiteName,
    supportedSites,
    fileInputRef,
    // Actions
    addSite,
    saveScript,
    selectSite,
    removeSite,
    closeEditor,
    exportSiteList,
    importSiteList,
    handleFileClick,
    refreshSupportedHostsIndex,
  };
}

// ─── Constate split ───────────────────────────────────────────────────────────
// Split into granular contexts so components only re-render when their
// specific slice of state changes.

export const [
  SupportedSiteProvider,
  // State slices
  useSupportedSites,
  useEditorState,
  // Action slices (stable refs — never trigger re-renders)
  useSiteActions,
  useImportExportActions,
] = constate(
  useSupportedSite,
  ({ supportedSites }) => supportedSites,
  ({
    siteDataEditorOpen,
    siteData,
    setSiteData,
    siteScript,
    setSiteScript,
    afterAddScript,
    setAfterAddScript,
    afterRemoveScript,
    setAfterRemoveScript,
    editingSiteName,
  }) => ({
    siteDataEditorOpen,
    siteData,
    setSiteData,
    siteScript,
    setSiteScript,
    afterAddScript,
    setAfterAddScript,
    afterRemoveScript,
    setAfterRemoveScript,
    editingSiteName,
  }),
  ({ addSite, saveScript, selectSite, removeSite, closeEditor }) => ({
    addSite,
    saveScript,
    selectSite,
    removeSite,
    closeEditor,
  }),
  ({
    exportSiteList,
    importSiteList,
    handleFileClick,
    fileInputRef,
    refreshSupportedHostsIndex,
  }) => ({
    exportSiteList,
    importSiteList,
    handleFileClick,
    fileInputRef,
    refreshSupportedHostsIndex,
  }),
);
