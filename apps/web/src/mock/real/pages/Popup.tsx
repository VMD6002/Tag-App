import "../globals";
import html from "../../../../../extension/src/entrypoints/popup/index.html?raw";
import css from "../../../../../extension/src/entrypoints/popup/style.css?raw";
import MockShell from "../../MockShell";

// The popup is static HTML + CSS with no script, so the real files are rendered as-is in an iframe.
const srcDoc = html.replace(
  /<link rel="stylesheet" href=".\/style.css" \/>/,
  `<style>${css}</style>`,
);

export default function Page() {
  return (
    <MockShell
      title="Popup"
      fidelity="real"
      note="the real popup/index.html and style.css; colours follow the browser's light/dark setting"
    >
      <div className="grid place-items-center p-10">
        <iframe
          title="Extension popup"
          srcDoc={srcDoc}
          className="h-72 w-64 border shadow-lg"
        />
      </div>
    </MockShell>
  );
}
