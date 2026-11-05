import { PresetSchema } from "@tagapp/utils/types";
import constate from "constate";
import { useAtom } from "jotai";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { confirm } from "@/components/craft/confirm-dialog";
import saveJsonFile from "@/lib/saveJsonFile";
import {
  supportedSitesAtom,
  useRefreshSupportedHostsIndex,
} from "../../atoms/supportedSites";

// ─── Schema & Types ────────────────────────────────────────────────────────────

export const SiteDataSchema = z
  .object({
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
  })
  // The overlay only shows presets when downloadType is set.
  // shortcut: text match on the script, so a commented-out assignment passes.
  .refine((d) => !d.download?.presets.length || /downloadType/.test(d.script), {
    message: "Presets are defined but the script never sets ctdls.downloadType",
    path: ["script"],
  });

export type SiteData = z.infer<typeof SiteDataSchema>;

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const defaultSiteScript = `ctdls.downloadType = "yt-dlp"
ctdls.title = document.title
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

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const addSite = useCallback(() => {
    setSiteData(DefaultSiteDataString);
    setSiteScript(defaultSiteScript);
    setAfterAddScript("");
    setAfterRemoveScript("");
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
      const New = { ...supportedSites };
      if (editingSiteName && editingSiteName !== data.name) {
        delete New[editingSiteName];
      }
      New[data.name] = data;
      setSupportedSites(New);
      refreshSupportedHostsIndex(New);
      setEditingSiteName(data.name);
      toast.success("Script Updated Successfully");
    } catch (error: any) {
      toast.error(
        error instanceof z.ZodError
          ? z.prettifyError(error)
          : (error?.message ?? ""),
      );
    }
  }, [
    siteData,
    siteScript,
    editingSiteName,
    afterAddScript,
    afterRemoveScript,
    supportedSites,
    refreshSupportedHostsIndex,
    setSupportedSites,
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
    async (siteName: string) => {
      if (!(await confirm(`Are you sure you want to remove ${siteName}?`)))
        return;
      const New = { ...supportedSites };
      delete New[siteName];
      await setSupportedSites(New);
      await refreshSupportedHostsIndex(New);
      if (editingSiteName === siteName) {
        setSiteDataEditorOpen(false);
        setEditingSiteName(null);
      }
    },
    [
      editingSiteName,
      supportedSites,
      refreshSupportedHostsIndex,
      setSupportedSites,
    ],
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
                toast.error(z.prettifyError(parsed.error));
                continue;
              }
              New[parsed.data.name] = parsed.data;
            }
            refreshSupportedHostsIndex(New);
            return New;
          });
        })
        .catch((error: any) => {
          toast.error("Error reading or parsing the JSON file");
          console.error("Error reading or parsing the JSON file:", error);
        });
    },
    [refreshSupportedHostsIndex, setSupportedSites],
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
