import { ipc_calculateGameStats } from "@replays/ipc";
import { FileResult } from "@replays/types";
import { StatsType } from "@slippi/slippi-js";
import _ from "lodash";
import { QueryObserverBaseResult, useQuery } from "react-query";

export interface UseLoadReplayFileResultData {
  file: FileResult;
  stats: StatsType;
}

type UseLoadReplayFileResult = QueryObserverBaseResult<UseLoadReplayFileResultData | undefined, Error | null>;

export const useLoadReplayFile = (filePath: string): UseLoadReplayFileResult => useQuery(["loadStatsQuery", filePath], async () => {
  const queryRes = await ipc_calculateGameStats.renderer!.trigger({ filePath: filePath });
  if (!queryRes.result) {
    console.error(`Error calculating game stats: ${filePath}`, queryRes.errors);
    throw new Error(`Error calculating game stats ${filePath}`);
  }
  return queryRes.result;
});
