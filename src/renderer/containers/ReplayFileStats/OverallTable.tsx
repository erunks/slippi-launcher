/** @jsx jsx */
import { jsx } from "@emotion/react";
import { FileResult } from "@replays/types";
import { StatsType } from "@slippi/slippi-js";

import _ from "lodash";
import React from "react";

import {
  lCancelValueMapper,
  renderHigherPercentFractionField,
  renderHigherSimpleRatioField,
  renderLowerSimpleRatioField,
  renderMultiStatField,
  renderOpeningField,
  renderPlayerHeaders,
} from "@/lib/renderStatsHelpers";
import * as T from "./TableStyles";

const columnCount = 5; // Unfortunately there is no way to specify a col span of "all" max cols there will be is 5
export interface OverallTableProps {
  file: FileResult;
  stats: StatsType;
}

export const OverallTable: React.FC<OverallTableProps> = ({ file, stats }) => {
  const renderOffenseSection = () => (
    <T.TableSection headerTitle="Offense" columnCount={columnCount}>
      {renderMultiStatField(stats, "Kills", "overall", {
        fieldPaths: "killCount",
        highlight: (v, ov) => v[0] > ov[0],
      })}
      {renderMultiStatField(stats, "Damage Done", "overall", {
        fieldPaths: "totalDamage",
        highlight: (v, ov) =>
          Boolean(v[0]) && Boolean(ov[0]) && parseInt(v[0].toString(), 10) > parseInt(ov[0].toString(), 10),
        valueMapper: (v) => v.toFixed(1),
      })}
      {renderHigherPercentFractionField(stats, "Opening Conversion Rate", "successfulConversions")}
      {renderLowerSimpleRatioField(stats, "Openings / Kill", "openingsPerKill")}
      {renderHigherSimpleRatioField(stats, "Damage / Opening", "damagePerOpening")}
    </T.TableSection>
  );

  const renderDefenseSection = () => (
    <T.TableSection headerTitle="Defense" columnCount={columnCount}>
      {renderMultiStatField(stats, "Actions (Roll / Air Dodge / Spot Dodge)", "actionCounts", {
        fieldPaths: ["rollCount", "airDodgeCount", "spotDodgeCount"],
      })}
    </T.TableSection>
  );

  const renderNeutralSection = () => (
    <T.TableSection headerTitle="Neutral" columnCount={columnCount}>
      {renderOpeningField(stats, "Neutral Wins", "neutralWinRatio")}
      {renderOpeningField(stats, "Counter Hits", "counterHitRatio")}
      {renderOpeningField(stats, "Beneficial Trades", "beneficialTradeRatio")}
      {renderMultiStatField(stats, "Actions (Wavedash / Waveland / Dash Dance / Ledgegrab)", "actionCounts", {
        fieldPaths: ["wavedashCount", "wavelandCount", "dashDanceCount", "ledgegrabCount"],
      })}
    </T.TableSection>
  );

  const renderGeneralSection = () => (
    <T.TableSection headerTitle="General" columnCount={columnCount}>
      {renderHigherSimpleRatioField(stats, "Inputs / Minute", "inputsPerMinute")}
      {renderHigherSimpleRatioField(stats, "Digital Inputs / Minute", "digitalInputsPerMinute")}
      {renderMultiStatField(stats, "L-Cancel Success Rate", "actionCounts", {
        arrPathExtension: "lCancelCount",
        valueMapper: lCancelValueMapper,
      })}
    </T.TableSection>
  );

  return (
    <T.Table>
      {renderPlayerHeaders(file)}
      {renderOffenseSection()}
      {renderDefenseSection()}
      {renderNeutralSection()}
      {renderGeneralSection()}
    </T.Table>
  );
};
