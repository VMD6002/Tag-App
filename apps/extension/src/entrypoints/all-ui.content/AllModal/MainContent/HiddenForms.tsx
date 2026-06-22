import { useMainContext } from "./Main.Context";
import { useSetAtom } from "jotai";
import { loadAtom } from "./Main.Context";

export default function HiddenForms() {
  const setLoad = useSetAtom(loadAtom);
  const { checkExistance, countRef } = useMainContext();

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
