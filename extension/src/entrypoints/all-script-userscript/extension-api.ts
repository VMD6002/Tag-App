import log from "@/lib/log";

export function clickUpdateOrRefresh(
  parentDiv: HTMLScriptElement,
  contentData: object,
  isMounted: { value: boolean },
  firstRun = false
) {
  parentDiv.textContent = JSON.stringify(contentData);
  if (firstRun || !isMounted.value) {
    document.documentElement.append(parentDiv);
    isMounted.value = true;
  }

  document
    .querySelector("tag-app-ext-overlay")
    ?.shadowRoot?.querySelector<HTMLInputElement>("#loadAndRefresh")
    ?.click();
}

export function clickRemove() {
  try {
    document
      .querySelector("tag-app-ext-overlay")
      ?.shadowRoot?.querySelector<HTMLInputElement>("#remove")
      ?.click();
  } catch {
    log("Couldn't click remove button");
  }
}
