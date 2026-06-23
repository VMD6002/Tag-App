import { atom } from "jotai";
import { RPCLink } from "@orpc/client/fetch";
import { createORPCClient, onError } from "@orpc/client";
import { routerType } from "@tagapp/api";
import { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { serverUrlAtom } from "./settings";

export const orpcAtom = atom(async (get) => {
  const serverUrl = await get(serverUrlAtom);

  // 1. Fallback to a syntactically valid placeholder URL if storage isn't ready.
  // This satisfies the native URL constructor on the first frame.
  const validBaseUrl = serverUrl || "http://localhost-placeholder";

  const link = new RPCLink({
    url: `${validBaseUrl}/rpc`,
    fetch: serverUrl ? undefined : () => new Promise(() => {}),
    interceptors: [
      onError((error) => {
        console.error(error);
      }),
    ],
  });

  const client: RouterClient<routerType> = createORPCClient(link);

  return createTanstackQueryUtils(client);
});
