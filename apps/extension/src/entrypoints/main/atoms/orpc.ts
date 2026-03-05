import { atom } from "jotai";
import { RPCLink } from "@orpc/client/fetch";
import { createORPCClient, onError } from "@orpc/client";
import { router } from "@tagapp/api";
import { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { serverUrlAtom } from "./settings";

export const orpcAtom = atom(async (get) => {
  const serverUrl = await get(serverUrlAtom);
  const link = new RPCLink({
    url: `${serverUrl}/rpc`,
    interceptors: [
      onError((error) => {
        console.error(error);
      }),
    ],
  });

  const client: RouterClient<router> = createORPCClient(link);

  return createTanstackQueryUtils(client);
});
