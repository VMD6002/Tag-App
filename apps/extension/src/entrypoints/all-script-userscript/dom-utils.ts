const pTag = document.createElement("p");
export function decodeHtmlEntities(str: string): string {
  pTag.innerHTML = str;
  return pTag.textContent;
}

// biome-ignore lint/suspicious/noExplicitAny: arbitrary JSON-LD, shape is site-specific
export function getMicroData(): any {
  const el = document.querySelector<HTMLScriptElement>(
    "script[type='application/ld+json']",
  );
  const text = el?.textContent;
  if (!text) throw new Error("No ld+json script found");
  return JSON.parse(text);
}

export const getOgImage = () =>
  document.querySelector<HTMLMetaElement>("meta[property='og:image']")?.content;
