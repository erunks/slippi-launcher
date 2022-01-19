/** @jsx jsx */
import { jsx } from "@emotion/react";
import { FileResult } from "@replays/types";
import { RatioType, StatsType } from "@slippi/slippi-js";
import { extractPlayerNames } from "common/matchNames";

import _ from "lodash";

import * as T from "@/containers/ReplayFileStats/TableStyles";
import { getCharacterIcon } from "./utils";

const numberIsHigher = (a: number, b: number) => Number.isNaN(b) || a > b;
const numberIsLower = (a: number, b: number) => Number.isNaN(b) || a < b;
export const lCancelValueMapper = (val: any) => {
  if (!val) {
    return "N/A";
  }

  const { fail, success } = val;
  const total = success + fail;
  const rate = total === 0 ? 0 : (success / total) * 100;
  return `${rate.toFixed(0)}% (${success} / ${total})`;
};

export const renderPlayerHeaders = (file: FileResult) => {
  const tableHeaders = [];
  for (const p of file.settings.players) {
    const names = extractPlayerNames(p.playerIndex, file.settings, file.metadata);
    tableHeaders.push(
      <T.TableHeaderCell key={p.playerIndex}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={getCharacterIcon(p.characterId, p.characterColor)}
            height={24}
            width={24}
            style={{
              marginRight: 10,
            }}
          />
          <div style={{ fontWeight: 500 }}>{names.name || names.tag || `Player ${p.playerIndex + 1}`}</div>
        </div>
      </T.TableHeaderCell>,
    );
  }

  return (
    <thead>
      <T.TableRow>
        <T.TableHeaderCell />
        {tableHeaders}
      </T.TableRow>
    </thead>
  );
};

interface MutliStatFieldOptions {
  fieldPaths?: string | string[];
  arrPathExtension?: string | string[];
  highlight?: (v: any[], ov: any[]) => boolean;
  valueMapper?: (a: any) => string;
}

export const renderMultiStatField = (
  stats: StatsType,
  header: string,
  arrPath: string | string[],
  options?: MutliStatFieldOptions,
  renderSencondPlayerStat = true,
) => {
  const key = `standard-field-${header}`;

  const arr = _.get(stats, arrPath, []);
  const itemsByPlayer = arr;

  if (!arr || arr.length === 0) {
    return (
      <T.TableRow key={key}>
        <T.TableCell>{header}</T.TableCell>
        <T.TableCell>Doubles is not supported for this field</T.TableCell>
      </T.TableRow>
    );
  }
  const player1Item = options?.arrPathExtension
    ? _.get(itemsByPlayer[0], options.arrPathExtension)
    : itemsByPlayer[0] || {};
  const player2Item = options?.arrPathExtension
    ? _.get(itemsByPlayer[1], options.arrPathExtension)
    : itemsByPlayer[1] || {};
  const generateValues = (item: any) => {
    if (options?.fieldPaths !== undefined) {
      return _.chain(item)
        .pick(options.fieldPaths)
        .toArray()
        .map((v) => (options?.valueMapper ? options.valueMapper(v) : v))
        .value();
    }

    if (options?.valueMapper) {
      return [options.valueMapper(item)];
    }

    return [item];
  };

  const p1Values = generateValues(player1Item);
  const p2Values = generateValues(player2Item);

  return (
    <T.TableRow key={key}>
      <T.TableCell>{header}</T.TableCell>
      <T.TableCell highlight={options?.highlight && options.highlight(p1Values, p2Values)}>
        <div>{p1Values.join(" / ")}</div>
      </T.TableCell>
      {renderSencondPlayerStat && (
        <T.TableCell highlight={options?.highlight && options.highlight(p2Values, p1Values)}>
          <div>{p2Values.join(" / ")}</div>
        </T.TableCell>
      )}
    </T.TableRow>
  );
};

export const renderRatioStatField = (
  stats: StatsType,
  header: string,
  arrPath: string,
  fieldPath: string,
  ratioRenderer: (ratio: RatioType, oppRatio: RatioType) => JSX.Element,
  renderSencondPlayerStat = true,
) => {
  const arr = _.get(stats, arrPath, []);
  const itemsByPlayer = arr;

  const player1Item = itemsByPlayer[0] || {};
  const player2Item = itemsByPlayer[1] || {};

  const displayRenderer = (firstPlayer: boolean) => {
    const item = firstPlayer ? player1Item : player2Item;
    const oppItem = firstPlayer ? player2Item : player1Item;

    const ratio = _.get(item, fieldPath);
    const oppRatio = _.get(oppItem, fieldPath);

    return ratioRenderer(ratio, oppRatio);
  };

  const key = `standard-field-${header.toLowerCase()}`;
  return (
    <T.TableRow key={key}>
      <T.TableCell>{header}</T.TableCell>
      {displayRenderer(true)}
      {renderSencondPlayerStat && displayRenderer(false)}
    </T.TableRow>
  );
};

export const renderSimpleRatioField = (
  stats: StatsType,
  header: string,
  arrPath: string,
  fieldPath: string,
  highlightCondition: (a: number, b: number) => boolean,
  renderSencondPlayerStat = true,
) => {
  return renderRatioStatField(
    stats,
    header,
    arrPath,
    fieldPath,
    (ratio: RatioType, oppRatio: RatioType) => {
      const playerRatio = _.get(ratio, "ratio", null);
      const oppRatioType = _.get(oppRatio, "ratio", null);

      if (playerRatio === null) {
        return (
          <T.TableCell>
            <div>N/A</div>
          </T.TableCell>
        );
      }
      const fixedPlayerRatio = playerRatio.toFixed(1);
      const fixedOppRatio = oppRatioType !== null ? oppRatioType.toFixed(1) : "Infinity";
      return (
        <T.TableCell highlight={highlightCondition(parseFloat(fixedPlayerRatio), parseFloat(fixedOppRatio))}>
          <div>{fixedPlayerRatio}</div>
        </T.TableCell>
      );
    },
    renderSencondPlayerStat,
  );
};

export const renderPercentFractionField = (
  stats: StatsType,
  header: string,
  arrPath: string,
  fieldPath: string,
  highlightCondition: (a: number, b: number) => boolean,
) => {
  return renderRatioStatField(stats, header, arrPath, fieldPath, (ratio, oppRatio) => {
    const playerRatio = _.get(ratio, "ratio", null);
    const oppRatioType = _.get(oppRatio, "ratio", null);

    if (playerRatio === null || oppRatioType === null) {
      return (
        <T.TableCell>
          <div>N/A</div>
        </T.TableCell>
      );
    }
    const fixedPlayerRatio = playerRatio.toFixed(3);
    const fixedOppRatio = oppRatioType.toFixed(3);

    const playerCount = _.get(ratio, "count");
    const playerTotal = _.get(ratio, "total");

    return (
      <T.TableCell highlight={highlightCondition(parseFloat(fixedPlayerRatio), parseFloat(fixedOppRatio))}>
        <div>
          <div style={{ display: "inline-block", marginRight: "8px" }}>{Math.round(playerRatio * 1000) / 10}%</div>
          <div style={{ display: "inline-block" }}>
            ({playerCount} / {playerTotal})
          </div>
        </div>
      </T.TableCell>
    );
  });
};

export const renderHigherSimpleRatioField = (stats: StatsType, header: string, field: string) => {
  return renderSimpleRatioField(stats, header, "overall", field, numberIsHigher);
};

export const renderHigherPercentFractionField = (stats: StatsType, header: string, field: string) => {
  return renderPercentFractionField(stats, header, "overall", field, numberIsHigher);
};

export const renderLowerSimpleRatioField = (stats: StatsType, header: string, field: string) => {
  return renderSimpleRatioField(stats, header, "overall", field, numberIsLower);
};

export const renderCountPercentField = (
  stats: StatsType,
  header: string,
  arrPath: string,
  fieldPath: string,
  highlightCondition: (a: number, b: number) => boolean,
  renderSencondPlayerStat = true,
) => {
  return renderRatioStatField(
    stats,
    header,
    arrPath,
    fieldPath,
    (ratio: RatioType, oppRatio: RatioType) => {
      const playerCount = _.get(ratio, "count", 0);
      const playerRatio = _.get(ratio, "ratio");

      const oppCount = _.get(oppRatio, "count", 0);

      let secondaryDisplay = null;
      if (playerRatio !== null) {
        secondaryDisplay = <div style={{ display: "inline-block" }}>({Math.round(playerRatio * 100)}%)</div>;
      }

      return (
        <T.TableCell highlight={highlightCondition(playerCount, oppCount)}>
          <div>
            <div style={{ display: "inline-block", marginRight: "8px" }}>{playerCount}</div>
            {secondaryDisplay}
          </div>
        </T.TableCell>
      );
    },
    renderSencondPlayerStat,
  );
};

export const renderOpeningField = (stats: StatsType, header: string, field: string) => {
  return renderCountPercentField(stats, header, "overall", field, numberIsHigher);
};
