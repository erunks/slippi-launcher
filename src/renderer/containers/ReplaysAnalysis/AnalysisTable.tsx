/** @jsx jsx */
import { jsx } from "@emotion/react";
import { FileResult } from "@replays/types";
import { StatsType } from "@slippi/slippi-js";

import _ from "lodash";
import React, { useEffect, useState } from "react";

import * as T from "@/containers/ReplayFileStats/TableStyles";
import { collectStatsByPlayer, getPlayerIndexByUserPlayKey } from "@/lib/dataUtils";
import { useAccount } from "@/lib/hooks/useAccount";
import {
  lCancelValueMapper,
  renderCountPercentField,
  renderMultiStatField,
  renderPlayerHeaders,
  renderSimpleRatioField,
} from "@/lib/renderStatsHelpers";

const columnCount = 2; // Unfortunately there is no way to specify a col span of "all" max cols there will be is 5

export interface AnalysisTableProps {
  files: FileResult[];
  stats: StatsType[];
}

export const AnalysisTable: React.FC<AnalysisTableProps> = ({ files, stats }) => {
  const [totalStats, setTotalStats] = useState<StatsType>({} as StatsType);
  const userPlayKey = useAccount((store) => store.playKey);

  const clonedFirstFile = _.cloneDeep(files[0]);
  const firstFileSettings = clonedFirstFile.settings;
  firstFileSettings.players = [firstFileSettings.players[getPlayerIndexByUserPlayKey(firstFileSettings, userPlayKey)]];

  useEffect(() => {
    setTotalStats(collectStatsByPlayer(files, stats, userPlayKey));
  }, [files, stats]);

  const noHighlightFunc = () => false;

  const renderOffenseSection = () => [
    <T.TableSection headerTitle="Offense" columnCount={columnCount}>
      {renderMultiStatField(totalStats, "Total Kills", "overall", { fieldPaths: "killCount" }, false)}
      {renderMultiStatField(
        totalStats,
        "Total Damage Done",
        "overall",
        { fieldPaths: "totalDamage", valueMapper: (v) => v.toFixed(1) },
        false,
      )}
      {renderSimpleRatioField(
        totalStats,
        "Avg. Opening Conversion Rate",
        "overall",
        "successfulConversions",
        noHighlightFunc,
        false,
      )}
      {renderSimpleRatioField(totalStats, "Avg. Openings / Kill", "overall", "openingsPerKill", noHighlightFunc, false)}
      {renderSimpleRatioField(
        totalStats,
        "Avg. Damage / Opening",
        "overall",
        "damagePerOpening",
        noHighlightFunc,
        false,
      )}
    </T.TableSection>,
  ];

  const renderDefenseSection = () => [
    <T.TableSection headerTitle="Defense" columnCount={columnCount}>
      {renderMultiStatField(
        totalStats,
        "Total Actions (Roll / Air Dodge / Spot Dodge)",
        "actionCounts",
        { fieldPaths: ["rollCount", "airDodgeCount", "spotDodgeCount"] },
        false,
      )}
    </T.TableSection>,
  ];

  const renderNeutralSection = () => [
    <T.TableSection headerTitle="Neutral" columnCount={columnCount}>
      {renderCountPercentField(totalStats, "Avg. Neutral Wins", "overall", "neutralWinRatio", noHighlightFunc, false)}
      {renderCountPercentField(totalStats, "Avg. Counter Hits", "overall", "counterHitRatio", noHighlightFunc, false)}
      {renderCountPercentField(
        totalStats,
        "Avg. Beneficial Trades",
        "overall",
        "beneficialTradeRatio",
        noHighlightFunc,
        false,
      )}
      {renderMultiStatField(
        totalStats,
        "Total Actions (Wavedash / Waveland / Dash Dance / Ledgegrab)",
        "actionCounts",
        { fieldPaths: ["wavedashCount", "wavelandCount", "dashDanceCount", "ledgegrabCount"] },
        false,
      )}
    </T.TableSection>,
  ];

  const renderGeneralSection = () => [
    <T.TableSection headerTitle="General" columnCount={columnCount}>
      {renderSimpleRatioField(totalStats, "Avg. Inputs / Minute", "overall", "inputsPerMinute", noHighlightFunc, false)}
      {renderSimpleRatioField(
        totalStats,
        "Avg. Digital Inputs / Minute",
        "overall",
        "digitalInputsPerMinute",
        noHighlightFunc,
        false,
      )}
      {renderMultiStatField(
        totalStats,
        "Avg. L-Cancel Success Rate",
        "actionCounts",
        {
          arrPathExtension: "lCancelCount",
          valueMapper: lCancelValueMapper,
        },
        false,
      )}
    </T.TableSection>,
  ];

  return (
    <T.Table>
      {renderPlayerHeaders(clonedFirstFile)}
      {renderOffenseSection()}
      {renderDefenseSection()}
      {renderNeutralSection()}
      {renderGeneralSection()}
    </T.Table>
  );
};
