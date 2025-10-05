import { SiteData } from "@/entrypoints/main/routes/supported";
import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

export default function useSupportedSites() {
  const [supportedSites, setSupportedSites] = useStorage<
    Record<string, SiteData>
  >(
    {
      key: "supportedSites",
      instance: new Storage({
        area: "local",
      }),
    },
    (v) => (v === undefined ? {} : v)
  );

  const [, setSupportedHostsIndex] = useStorage<Record<string, string>>(
    {
      key: "supportedHostsIndex",
      instance: new Storage({
        area: "local",
      }),
    },
    (v) => (v === undefined ? {} : v)
  );

  const addSupportedHostsToIndex = useCallback(
    (SiteName: string, supportedSitesList: string[]) => {
      // @ts-ignore
      setSupportedHostsIndex((old: Record<string, string>) => {
        supportedSitesList.forEach((site) => (old[site] = SiteName));
        return old;
      });
    },
    []
  );

  const refreshSupportedHostsIndex = useCallback(
    (supportSSites?: typeof supportedSites) => {
      setSupportedHostsIndex(() => {
        let index: Record<string, string> = {};
        if (supportSSites) {
          for (const Site in supportSSites) {
            for (const host of supportSSites[Site].Hosts) index[host] = Site;
          }
          return index;
        }
        for (const Site in supportedSites) {
          for (const host of supportedSites[Site].Hosts) index[host] = Site;
        }
        return index;
      });
    },
    [supportedSites]
  );

  return {
    supportedSites,
    setSupportedSites,
    addSupportedHostsToIndex,
    refreshSupportedHostsIndex,
  };
}
