import * as fix from "./routers/fix.js";
import * as main from "./routers/main.js";
import { settingsDB } from "./db/settings.js";

export const router = {
  fix,
  main,
};

export const settings = settingsDB.data;

export type routerType = typeof router;
