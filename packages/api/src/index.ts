import * as main from "./routers/main";
import * as restoreAndBackup from "./routers/restoreAndBackup";
import * as tags from "./routers/tags";

export const router = {
  tags,
  main,
  restoreAndBackup,
};

export { settingsDB } from "./db/settings";

export type routerType = typeof router;
