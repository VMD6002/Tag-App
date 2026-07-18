import * as tags from "./routers/tags";
import * as main from "./routers/main";
import * as restoreAndBackup from "./routers/restoreAndBackup";
import { settingsDB } from "./db/settings";

export const router = {
  tags,
  main,
  restoreAndBackup,
};

export const settings = settingsDB.data;

export type routerType = typeof router;
