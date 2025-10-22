import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

export default function useSettingsData() {
  const [imgSetWidth, setImgSetWidth] = useStorage<number | string>(
    {
      key: "imgSetWidth",
      instance: new Storage({
        area: "local",
      }),
    },
    (v) => (v === undefined ? "100" : v)
  );

  const [serverUrl, setServerUrl] = useStorage<string>(
    {
      key: "serverUrl",
      instance: new Storage({
        area: "local",
      }),
    },
    (v) => (v === undefined ? "http://localhost:3000" : v)
  );

  const [serverFeatures, setServerFeatures] = useStorage<boolean>(
    {
      key: "serverFeatures",
      instance: new Storage({
        area: "local",
      }),
    },
    (v) => (v === undefined ? true : v)
  );

  const [overwrite, setOverwrite] = useStorage<{
    export: boolean;
    import: boolean;
  }>(
    {
      key: "Overwrite",
      instance: new Storage({
        area: "local",
      }),
    },
    (v) =>
      v === undefined
        ? {
            export: true,
            import: true,
          }
        : v
  );

  return {
    serverUrl,
    setServerUrl,
    // --
    imgSetWidth,
    setImgSetWidth,
    // --
    serverFeatures,
    setServerFeatures,
    // --
    overwrite,
    setOverwrite,
  };
}
