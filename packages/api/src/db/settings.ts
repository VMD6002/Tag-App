import { JSONFilePreset } from "lowdb/node";

const settings_default = {
  port: 5000,
  replaceWithKeyOnUpdate: true,
  sanitizeTitleOnSave: false,
  constants: {},
};

export const settingsDB = await JSONFilePreset(
  "./settings.json",
  settings_default,
);
await settingsDB.write();
await settingsDB.read();
