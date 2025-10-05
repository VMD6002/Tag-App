import { readFileSync, existsSync, writeFileSync } from "node:fs";

export default function getDefaults() {
  let settings = {
    port: 3000,
  };

  if (!existsSync("./settings.json")) {
    writeFileSync("./settings.json", JSON.stringify(settings, null, 2));
  } else {
    settings = JSON.parse(readFileSync("./settings.json").toString());
  }
  return settings;
}
