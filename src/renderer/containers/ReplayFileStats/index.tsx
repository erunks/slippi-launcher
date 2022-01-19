/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import styled from "@emotion/styled";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import ErrorIcon from "@material-ui/icons/Error";
import FolderIcon from "@material-ui/icons/Folder";
import HelpIcon from "@material-ui/icons/Help";
import { FileResult } from "@replays/types";
import { colors } from "common/colors";
import { shell } from "electron";
import _ from "lodash";
import React from "react";

import { BasicFooter } from "@/components/Footer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { IconMessage } from "@/components/Message";
import { useLoadReplayFile } from "@/lib/hooks/useLoadReplayFile";
import { useMousetrap } from "@/lib/hooks/useMousetrap";
import { withFont } from "@/styles/withFont";

import { GameProfile } from "./GameProfile";
import { GameProfileHeader } from "./GameProfileHeader";

export const Outer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: auto;
`;

export interface ReplayFileStatsProps {
  filePath: string;
  file?: FileResult;
  index: number | null;
  total: number | null;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  onPlay: () => void;
}

export const ReplayFileStats: React.FC<ReplayFileStatsProps> = (props) => {
  const { filePath } = props;

  const gameStatsQuery = useLoadReplayFile(filePath);

  const isLoading = gameStatsQuery.isLoading;
  const error = gameStatsQuery.error as Error;

  const file = gameStatsQuery.data?.file ?? props.file;
  const numPlayers = file?.settings.players.length;
  const gameStats = gameStatsQuery.data?.stats ?? null;

  // Add key bindings
  useMousetrap("escape", () => {
    if (!isLoading) {
      props.onClose();
    }
  });
  useMousetrap("left", () => {
    if (!isLoading) {
      props.onPrev();
    }
  });
  useMousetrap("right", () => {
    if (!isLoading) {
      props.onNext();
    }
  });

  const handleRevealLocation = () => shell.showItemInFolder(filePath);

  // We only want to show this full-screen error if we don't have a
  // file in the prop. i.e. the SLP manually opened.
  if (!props.file && error) {
    return (
      <IconMessage Icon={ErrorIcon}>
        <div
          css={css`
            max-width: 800px;
            word-break: break-word;
            text-align: center;
          `}
        >
          <h2>Uh oh. We couldn't open that file. It's probably corrupted.</h2>
          <Button color="secondary" onClick={props.onClose}>
            Go back
          </Button>
        </div>
      </IconMessage>
    );
  }

  if (!file) {
    return <LoadingScreen message="Loading..." />;
  }

  return (
    <Outer>
      <GameProfileHeader {...props} file={file} disabled={isLoading} stats={gameStats} onPlay={props.onPlay} />
      <Content>
        {!file || isLoading ? (
          <LoadingScreen message={"Crunching numbers..."} />
        ) : numPlayers !== 2 ? (
          <IconMessage Icon={ErrorIcon} label="Game stats for doubles is unsupported" />
        ) : error ? (
          <IconMessage Icon={ErrorIcon} label={`Error: ${error.message ?? JSON.stringify(error, null, 2)}`} />
        ) : gameStats ? (
          <GameProfile file={file} stats={gameStats}></GameProfile>
        ) : (
          <IconMessage Icon={HelpIcon} label="No stats computed" />
        )}
      </Content>
      <BasicFooter>
        <Tooltip title="Reveal location">
          <IconButton onClick={handleRevealLocation} size="small">
            <FolderIcon
              css={css`
                color: ${colors.purpleLight};
              `}
            />
          </IconButton>
        </Tooltip>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            margin-left: 10px;
            padding-right: 20px;
          `}
        >
          <div
            css={css`
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 4px;
              text-transform: uppercase;
              font-family: ${withFont("Maven Pro")};
            `}
          >
            Current File
          </div>
          <div
            css={css`
              color: white;
            `}
          >
            {filePath}
          </div>
        </div>
      </BasicFooter>
    </Outer>
  );
};
