/** @jsx jsx */
import { jsx } from "@emotion/react";
import { FileResult } from "@replays/types";
import { StatsType } from "@slippi/slippi-js";

import _ from "lodash";
import React from "react";

import {
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
  const renderOffenseSection = () => {
    return [
      <thead key="offense-header">
        <tr>
          <T.TableSubHeaderCell colSpan={columnCount}>Offense</T.TableSubHeaderCell>
        </tr>
      </thead>,
      <tbody key="offense-body">
        {renderMultiStatField(stats, "Kills", "overall", "killCount", (v, ov) => v[0] > ov[0])}
        {renderMultiStatField(
          stats,
          "Damage Done",
          "overall",
          "totalDamage",
          (v, ov) => Boolean(v[0]) && Boolean(ov[0]) && parseInt(v[0].toString(), 10) > parseInt(ov[0].toString(), 10),
          (v) => v.toFixed(1),
        )}
        {renderHigherPercentFractionField(stats, "Opening Conversion Rate", "successfulConversions")}
        {renderLowerSimpleRatioField(stats, "Openings / Kill", "openingsPerKill")}
        {renderHigherSimpleRatioField(stats, "Damage / Opening", "damagePerOpening")}
      </tbody>,
    ];
  };

  const renderDefenseSection = () => {
    return [
      <thead key="defense-header">
        <tr>
          <T.TableSubHeaderCell colSpan={columnCount}>Defense</T.TableSubHeaderCell>
        </tr>
      </thead>,
      <tbody key="defense-body">
        {renderMultiStatField(stats, "Actions (Roll / Air Dodge / Spot Dodge)", "actionCounts", [
          "rollCount",
          "airDodgeCount",
          "spotDodgeCount",
        ])}
      </tbody>,
    ];
  };

  const renderNeutralSection = () => {
    return [
      <thead key="neutral-header">
        <tr key="neutral-header">
          <T.TableSubHeaderCell colSpan={columnCount}>Neutral</T.TableSubHeaderCell>
        </tr>
      </thead>,
      <tbody key="neutral-body">
        {renderOpeningField(stats, "Neutral Wins", "neutralWinRatio")}
        {renderOpeningField(stats, "Counter Hits", "counterHitRatio")}
        {renderOpeningField(stats, "Beneficial Trades", "beneficialTradeRatio")}
        {renderMultiStatField(stats, "Actions (Wavedash / Waveland / Dash Dance / Ledgegrab)", "actionCounts", [
          "wavedashCount",
          "wavelandCount",
          "dashDanceCount",
          "ledgegrabCount",
        ])}
      </tbody>,
    ];
  };

  const renderGeneralSection = () => {
    return [
      <thead key="general-header">
        <tr>
          <T.TableSubHeaderCell colSpan={columnCount}>General</T.TableSubHeaderCell>
        </tr>
      </thead>,
      <tbody key="neutral-body">
        {renderHigherSimpleRatioField(stats, "Inputs / Minute", "inputsPerMinute")}
        {renderHigherSimpleRatioField(stats, "Digital Inputs / Minute", "digitalInputsPerMinute")}
        {renderMultiStatField(
          stats,
          "L-Cancel Success Rate",
          "actionCounts",
          null,
          undefined,
          (val: any) => {
            if (!val) {
              return "N/A";
            }

            const { fail, success } = val;
            const total = success + fail;
            const rate = total === 0 ? 0 : (success / (success + fail)) * 100;
            return `${rate.toFixed(0)}% (${success} / ${total})`;
          },
          "lCancelCount",
        )}
      </tbody>,
    ];
  };

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
