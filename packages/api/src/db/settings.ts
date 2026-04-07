import { JSONFilePreset } from "lowdb/node";

const settings_default = {
  port: 4000,
  suwaUrl: "http://localhost:4567",
};

export const settingsDB = await JSONFilePreset(
  "./settings.json",
  settings_default,
);
await settingsDB.write();
await settingsDB.read();
