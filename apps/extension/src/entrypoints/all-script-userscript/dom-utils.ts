const pTag = document.createElement("p");
export function decodeHtmlEntities(str: string): string {
  pTag.innerHTML = str;
  return pTag.textContent!;
}

export function getMicroData(): any {
  const el = document.querySelector<HTMLScriptElement>(
    "script[type='application/ld+json']"
  );
  return JSON.parse(el!.textContent!);
}

export const getOgImage = () =>
  document.querySelector<HTMLMetaElement>("meta[property='og:image']")?.content;
