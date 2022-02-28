/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { FileResult } from "@replays/types";
import { StatsType } from "@slippi/slippi-js";

import _ from "lodash";
import React from "react";

import { Header } from "@/containers/ReplayFileStats/GameProfileHeader";
import { AnalysisPlayerInfo } from "./AnalysisPlayerInfo";

export interface AnalysisHeaderProps {
  files: FileResult[];
  stats: StatsType[];
  total: number | null;
  onClose: () => void;
}

export const AnalysisHeader: React.FC<AnalysisHeaderProps> = ({ files, onClose }) => {
  const metadatas = _.map(files, (file) => file.metadata) ?? [];
  const settings = _.map(files, (file) => file.settings) ?? [];

  return (
    <Header>
      <div
        css={css`
          display: flex;
          justify-content: space-between;
          align-items: center;
        `}
      >
        <div
          css={css`
            display: flex;
            flex-direction: column;
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <div>
              <Tooltip title="Back to replays">
                <span>
                  <IconButton
                    onClick={onClose}
                    css={css`
                      padding: 8px;
                    `}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
            <AnalysisPlayerInfo metadatas={metadatas} settings={settings} />
          </div>
        </div>
      </div>
    </Header>
  );
};
