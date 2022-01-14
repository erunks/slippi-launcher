/** @jsx jsx */
import { jsx } from "@emotion/react";
import { FileResult } from "@replays/types";
import { RatioType, StatsType } from "@slippi/slippi-js";
import { extractPlayerNames } from "common/matchNames";

import _ from "lodash";

import * as T from "@/containers/ReplayFileStats/TableStyles";
import { getCharacterIcon } from "./utils";

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

export const renderMultiStatField = (
  stats: StatsType,
  header: string,
  arrPath: string | string[],
  fieldPaths: string | string[] | null,
  highlight?: (v: any[], ov: any[]) => boolean,
  valueMapper?: (a: any) => string,
  arrPathExtension?: string | string[],
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
  const player1Item = arrPathExtension ? _.get(itemsByPlayer[0], arrPathExtension) : itemsByPlayer[0] || {};
  const player2Item = arrPathExtension ? _.get(itemsByPlayer[1], arrPathExtension) : itemsByPlayer[1] || {};
  const generateValues = (item: any) => {
    if (fieldPaths !== null) {
      return _.chain(item)
        .pick(fieldPaths)
        .toArray()
        .map((v) => (valueMapper ? valueMapper(v) : v))
        .value();
    }

    if (valueMapper) {
      // return _.filter([valueMapper(item)], removeNullValues);
      return [valueMapper(item)];
    }

    return [item];
  };

  const p1Values = generateValues(player1Item);
  const p2Values = generateValues(player2Item);

  return (
    <T.TableRow key={key}>
      <T.TableCell>{header}</T.TableCell>
      <T.TableCell highlight={highlight && highlight(p1Values, p2Values)}>
        <div>{p1Values.join(" / ")}</div>
      </T.TableCell>
      <T.TableCell highlight={highlight && highlight(p2Values, p1Values)}>
        <div>{p2Values.join(" / ")}</div>
      </T.TableCell>
    </T.TableRow>
  );
};

export const renderRatioStatField = (
  stats: StatsType,
  header: string,
  arrPath: string,
  fieldPath: string,
  ratioRenderer: (ratio: RatioType, oppRatio: RatioType) => JSX.Element,
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
      {displayRenderer(false)}
    </T.TableRow>
  );
};

export const renderSimpleRatioField = (
  stats: StatsType,
  header: string,
  arrPath: string,
  fieldPath: string,
  highlightCondition: (a: number, b: number) => boolean,
) => {
  return renderRatioStatField(stats, header, arrPath, fieldPath, (ratio: RatioType, oppRatio: RatioType) => {
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
  });
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
  return renderSimpleRatioField(stats, header, "overall", field, (fixedPlayerRatio: number, fixedOppRatio: number) => {
    const oppIsNull = fixedPlayerRatio && Number.isNaN(fixedOppRatio);
    const isHigher = fixedPlayerRatio > fixedOppRatio;
    return oppIsNull || isHigher;
  });
};

export const renderLowerSimpleRatioField = (stats: StatsType, header: string, field: string) => {
  return renderSimpleRatioField(stats, header, "overall", field, (fixedPlayerRatio: number, fixedOppRatio: number) => {
    const oppIsNull = fixedPlayerRatio && Number.isNaN(fixedOppRatio);
    const isLower = fixedPlayerRatio < fixedOppRatio;
    return oppIsNull || isLower;
  });
};

export const renderHigherPercentFractionField = (stats: StatsType, header: string, field: string) => {
  return renderPercentFractionField(
    stats,
    header,
    "overall",
    field,
    (fixedPlayerRatio: number, fixedOppRatio: number) => {
      const oppIsNull = fixedPlayerRatio && Number.isNaN(fixedOppRatio);
      const isHigher = fixedPlayerRatio > fixedOppRatio;
      return oppIsNull || isHigher;
    },
  );
};

export const renderCountPercentField = (
  stats: StatsType,
  header: string,
  arrPath: string,
  fieldPath: string,
  highlightCondition: (a: number, b: number) => boolean,
) => {
  return renderRatioStatField(stats, header, arrPath, fieldPath, (ratio: RatioType, oppRatio: RatioType) => {
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
  });
};

export const renderOpeningField = (stats: StatsType, header: string, field: string) => {
  return renderCountPercentField(stats, header, "overall", field, (playerCount, oppCount) => playerCount > oppCount);
};
