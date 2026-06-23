import { RPCHandler } from "@orpc/server/message-port";
import { onError } from "@orpc/server";
import { contentDataAtom } from "../main/atoms";
import { getDefaultStore } from "jotai/vanilla";
import {
  constantsAtom,
  replaceWithKeyOnUpdateAtom,
} from "../main/atoms/constants";
import { tagParentsAtom, tagsAtom } from "../main/atoms/tags";
import * as main from "./main";
import { sanitizeTitleAtom } from "../main/atoms/settings";

export const store = getDefaultStore();

// Mount all storage atoms once at background startup
const storageAtoms = [
  contentDataAtom,
  replaceWithKeyOnUpdateAtom,
  sanitizeTitleAtom,
  constantsAtom,
  tagsAtom,
  tagParentsAtom,
];
storageAtoms.forEach((atom) => store.sub(atom, () => {}));

const localRouter = { main };

export type localRouterType = typeof localRouter;

export default defineBackground(() => {
  const handler = new RPCHandler(localRouter, {
    interceptors: [
      onError((error) => {
        console.error(error);
      }),
    ],
  });

  browser.runtime.onConnect.addListener((port) => {
    handler.upgrade(port, {
      context: {},
    });
  });
});
