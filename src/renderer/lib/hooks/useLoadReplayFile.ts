import { ipc_calculateGameStats } from "@replays/ipc";
import { FileResult } from "@replays/types";
import { StatsType } from "@slippi/slippi-js";
import _ from "lodash";
import { useMemo } from "react";
import { QueryObserverBaseResult, useQuery } from "react-query";

export interface UseLoadReplayFileResultData {
  file: FileResult;
  stats: StatsType;
}

// export interface UseLoadReplayFileResultData {
//   errors: Error[] | null;
//   result: {
//     file: FileResult;
//     stats: StatsType;
//   };
// }

export type UseLoadReplayFileResult = QueryObserverBaseResult<UseLoadReplayFileResultData | undefined, Error | null>;

export const useLoadReplayFile = (filePath: string): UseLoadReplayFileResult =>
  useQuery(["loadStatsQuery", filePath], async () => {
    const queryRes = await ipc_calculateGameStats.renderer!.trigger({ filePath: filePath });
    if (!queryRes.result) {
      console.error(`Error calculating game stats: ${filePath}`, queryRes.errors);
      throw new Error(`Error calculating game stats ${filePath}`);
    }
    return queryRes.result;
  });

// type UseLoadReplayFileResult = QueryObserverBaseResult<Promise<UseLoadReplayFileResultData> | undefined, Error | null>;
// export const useLoadReplayFile = (filePath: string, onResolved: (x: any) => void): UseLoadReplayFileResult =>
//   useQuery(
//     ["loadStatsQuery", filePath],
//     async () =>
//       await ipc_calculateGameStats
//         .renderer!.trigger({ filePath: filePath })
//         .then((data) => onResolved(data))
//         .catch((error) => {
//           console.error(`Error calculating game stats: ${filePath}`, error);
//           throw new Error(`Error calculating game stats ${filePath}`);
//         }),
//   );

type UseLoadReplayFilesResult = QueryObserverBaseResult<
  Promise<UseLoadReplayFileResultData>[] | undefined,
  Error[] | null
>;

export const useLoadReplayFiles = (filePaths: string[], onResolved: (x: any) => void): UseLoadReplayFilesResult =>
  useQuery(["loadStatsQuery", filePaths], () =>
    _.map(filePaths, async (filePath) => {
      return await ipc_calculateGameStats
        .renderer!.trigger({ filePath: filePath })
        .then((data) => onResolved(data))
        .catch((error) => {
          console.error(`Error calculating game stats: ${filePath}`, error);
          throw new Error(`Error calculating game stats ${filePath}`);
        });
    }),
  );

export const useGetReplayInfo = (
  queryResultData: UseLoadReplayFileResultData[] | UseLoadReplayFileResultData | undefined,
) =>
  useMemo(() => {
    const defaults = {
      errors: [],
      file: {} as FileResult,
      files: [] as FileResult[],
      gameStats: {} as StatsType,
      gamesStats: [] as StatsType[],
      numPlayers: 0,
    };

    if (!queryResultData) {
      return defaults;
    } else if (_.isArray(queryResultData)) {
      const errors: Error[] = _.chain(queryResultData)
        .filter((query) => !_.isEmpty(query.errors))
        .flatMap((query) => query.errors ?? [])
        .value();
      const files: FileResult[] = _.map(queryResultData, (query) => query.result.file);
      const gamesStats: StatsType[] = _.map(queryResultData, (query) => query.result.stats ?? []);

      return {
        ...defaults,
        errors,
        files,
        gamesStats,
      };
    } else {
      const { errors, result } = queryResultData;
      const file = result.file;
      const numPlayers = file.settings.players.length;

      return {
        ...defaults,
        errors: errors ?? [],
        file,
        gameStats: result.stats,
        numPlayers,
      };
    }
  }, [queryResultData]);
