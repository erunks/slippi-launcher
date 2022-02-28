/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import { GameStartType, MetadataType } from "@slippi/slippi-js";

import { extractPlayerNames } from "common/matchNames";
import _ from "lodash";
import React from "react";

import { Outer } from "@/containers/ReplayFileStats/GameProfileHeader";

import { getPlayerIndexByUserPlayKey, getPlayerInfoByUserPlayKey } from "@/lib/dataUtils";
import { useAccount } from "@/lib/hooks/useAccount";
import { getCharacterIcon } from "@/lib/utils";
import { withFont } from "@/styles/withFont";

export interface AnalysisPlayerInfoProps {
  settings: GameStartType[];
  metadatas: (MetadataType | null)[];
}

export const AnalysisPlayerInfo: React.FC<AnalysisPlayerInfoProps> = ({ settings, metadatas }) => {
  const userPlayKey = useAccount((store) => store.playKey);
  const playerInfos = getPlayerInfoByUserPlayKey(settings, userPlayKey);
  const player = playerInfos[0];
  const playerIndex = getPlayerIndexByUserPlayKey(settings[0], userPlayKey);
  const names = extractPlayerNames(playerIndex, settings[0], metadatas[0]);
  const backupName = player.type === 1 ? "CPU" : `Player`;

  return (
    <Outer>
      <div
        css={css`
          display: flex;
          justify-content: center;
          flex-direction: column;
          margin-right: 8px;
        `}
      >
        <div
          css={css`
            display: flex;
            align-items: center;
            font-family: ${withFont("Maven Pro")};
            font-size: 18px;
          `}
        >
          <span>{names.name || names.tag || backupName}</span>
        </div>
        {names.code && (
          <div
            css={css`
              color: rgba(255, 255, 255, 0.6);
              font-size: 14px;
              font-weight: 500;
            `}
          >
            {names.code}
          </div>
        )}
      </div>
      <div
        css={css`
          display: flex;
          img {
            align-self: center;
            width: 32px;
            margin-right: 8px;
            position: relative;
          }
        `}
      >
        {_.map(playerInfos, (playerInfo, idx) => {
          const uuid = `${idx}-${playerInfo.characterId}-${playerInfo.characterColor}`;

          return (
            <img
              key={`player-icon-${uuid}`}
              src={getCharacterIcon(playerInfo.characterId, playerInfo.characterColor)}
              alt={uuid}
              css={css`
                left: ${idx * -24}px;
              `}
            />
          );
        })}
      </div>
    </Outer>
  );
};
