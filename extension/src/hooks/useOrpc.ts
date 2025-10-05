import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { RouterClient } from "@orpc/server";
import type { router } from "#/server/src";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

export default function useOrpc() {
  const { serverUrl } = useSettingsData();
  // memoize link so it only rebuilds when serverUrl changes
  const link = useMemo(() => {
    return new RPCLink({
      url: `${serverUrl}/rpc`,
      interceptors: [
        onError((error) => {
          console.error(error);
        }),
      ],
    });
  }, [serverUrl]);

  // memoize client so it’s stable until link changes
  const client: RouterClient<router> = useMemo(() => {
    return createORPCClient(link);
  }, [link]);

  // memoize tanstack utils
  const orpc = useMemo(() => createTanstackQueryUtils(client), [client]);

  return orpc;
}
