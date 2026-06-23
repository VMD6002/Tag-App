import log from "@/lib/log";
import { SHADOW_ROOT_ID } from "@/lib/CONSTANTS";

export function clickUpdateOrRefresh(
  parentDiv: HTMLScriptElement,
  contentDetails: object,
  isMounted: { value: boolean },
  firstRun = [false],
) {
  parentDiv.textContent = JSON.stringify(contentDetails);
  if (firstRun[0] || !isMounted.value) {
    document.documentElement.append(parentDiv);
    isMounted.value = true;
    firstRun[0] = false;
  }

  document
    .querySelector(SHADOW_ROOT_ID)
    ?.shadowRoot?.querySelector<HTMLInputElement>("#loadAndRefresh")
    ?.click();
}

export function clickRemove() {
  try {
    document
      .querySelector(SHADOW_ROOT_ID)
      ?.shadowRoot?.querySelector<HTMLInputElement>("#remove")
      ?.click();
  } catch {
    log("Couldn't click remove button");
  }
}
