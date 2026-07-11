import { useSetAtom } from "jotai";
import { loadAtom } from "..";
import { useLocalContext } from "../LocalContent/Local.Context";
import { useRemoteContext } from "../RemoteContent/Remote.Context";

export default function HiddenForms({
  useContext,
}: {
  useContext: typeof useLocalContext | typeof useRemoteContext;
}) {
  const setLoad = useSetAtom(loadAtom);
  const { checkExistance, countRef } = useContext();

  return (
    <>
      <form
        style={{ display: "none" }}
        onSubmit={(e) => {
          e.preventDefault();
          countRef.current = 0;
          checkExistance();
        }}
      >
        <input id="loadAndRefresh" type="submit" />
      </form>
      <form
        style={{ display: "none" }}
        onSubmit={(e) => {
          e.preventDefault();
          setLoad(false);
        }}
      >
        <input id="remove" type="submit" />
      </form>
    </>
  );
}
