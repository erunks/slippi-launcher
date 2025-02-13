import { ipc_startBroadcast, ipc_stopBroadcast } from "@broadcast/ipc";
import type { StartBroadcastConfig } from "@broadcast/types";
import electronLog from "electron-log";

import { useAccount } from "./useAccount";

const log = electronLog.scope("useBroadcast");

export const useBroadcast = () => {
  const user = useAccount((store) => store.user);

  const startBroadcasting = async (config: Omit<StartBroadcastConfig, "authToken">) => {
    if (!user) {
      throw new Error("User is not logged in!");
    }

    const authToken = await user.getIdToken();
    log.info("Starting broadcast");
    const res = await ipc_startBroadcast.renderer!.trigger({
      ...config,
      authToken,
    });

    if (!res.result) {
      log.error("Error starting broadcast", res.errors);
      throw new Error("Error starting broadcast");
    }
  };

  const stopBroadcasting = async () => {
    const res = await ipc_stopBroadcast.renderer!.trigger({});
    if (!res.result) {
      log.error("Error stopping broadcast", res.errors);
      throw new Error("Error stopping broadcast");
    }
  };

  return [startBroadcasting, stopBroadcasting] as const;
};
