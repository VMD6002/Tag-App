import * as tags from "./routers/tags";
import * as main from "./routers/main";
import * as restoreAndBackup from "./routers/restoreAndBackup";

export const router = {
  tags,
  main,
  restoreAndBackup,
};

export { settingsDB } from "./db/settings";

export type routerType = typeof router;
