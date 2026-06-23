import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/message-port";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { localRouterType } from "@/entrypoints/background/index";

const port = browser.runtime.connect();

const link = new RPCLink({
  port,
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

const client: RouterClient<localRouterType> = createORPCClient(link);

export const localOrpc = createTanstackQueryUtils(client);
