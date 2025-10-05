import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { router } from "#/server/src";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

// memoize link so it only rebuilds when serverUrl changes
const link = new RPCLink({
  url: `${location.origin}/rpc`,
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

// memoize client so it’s stable until link changes
const client: RouterClient<router> = createORPCClient(link);

// memoize tanstack utils
export const orpc = createTanstackQueryUtils(client);
