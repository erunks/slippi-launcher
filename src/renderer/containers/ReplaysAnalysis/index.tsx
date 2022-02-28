/** @jsx jsx */
import { jsx } from "@emotion/react";
import ErrorIcon from "@material-ui/icons/Error";
import { ipc_calculateGameStats } from "@replays/ipc";
import { FileResult } from "@replays/types";
import { StatsType } from "@slippi/slippi-js";
import { useQuery } from "react-query";
import _ from "lodash";
import React from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingScreen } from "@/components/LoadingScreen";
import { IconMessage } from "@/components/Message";
import { Content, Outer } from "@/containers/ReplayFileStats";
import { StatSection } from "@/containers/ReplayFileStats/GameProfile";
import { UseLoadReplayFileResult } from "@/lib/hooks/useLoadReplayFile";
import { AnalysisHeader } from "./AnalysisHeader";
import { AnalysisTable } from "./AnalysisTable";

export interface ReplaysAnalysisProps {
  files: string[];
  total: number | null;
  onClose: () => void;
}

export const ReplaysAnalysis: React.FC<ReplaysAnalysisProps> = (props) => {
  const gameStatsQueries = _.map(
    props.files,
    (filePath) =>
      useQuery(["loadStatsQuery", filePath], async () => {
        const queryRes = await ipc_calculateGameStats.renderer!.trigger({ filePath: filePath });
        if (!queryRes.result) {
          console.error(`Error calculating game stats: ${filePath}`, queryRes.errors);
          throw new Error(`Error calculating game stats ${filePath}`);
        }
        return queryRes.result;
      }) as UseLoadReplayFileResult,
  );

  const isLoading: boolean = _.some(gameStatsQueries, "isLoading");
  const errors: Error[] = _.chain(gameStatsQueries)
    .filter((query: UseLoadReplayFileResult) => (query.error as Error) !== null)
    .map((query: UseLoadReplayFileResult) => query.error as Error)
    .value();
  const files: FileResult[] = _.map(gameStatsQueries, (query: UseLoadReplayFileResult) => (query as any).data?.file);
  const gamesStats: StatsType[] =
    _.map(gameStatsQueries, (query: UseLoadReplayFileResult) => (query as any).data?.stats) ?? [];

  if (isLoading) {
    return <LoadingScreen message={"Crunching numbers..."} />;
  } else if (errors.length > 0) {
    return <IconMessage Icon={ErrorIcon} label={`Error: ${JSON.stringify(errors, null, 2)}`} />;
  }

  return (
    <Outer>
      <AnalysisHeader {...props} files={files} stats={gamesStats} />
      <Content>
        <div style={{ flex: "1", margin: 20 }}>
          <StatSection title="Overall">
            <ErrorBoundary>
              <AnalysisTable files={files} stats={gamesStats} />
            </ErrorBoundary>
          </StatSection>
        </div>
      </Content>
    </Outer>
  );
};
