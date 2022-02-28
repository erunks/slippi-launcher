import { PlayKey } from "@dolphin/types";
import { FileResult } from "@replays/types";
import {
  ActionCountsType,
  ComboType,
  ConversionType,
  GameStartType,
  InputCountsType,
  MetadataType,
  MoveLandedType,
  OverallType,
  PlayerType,
  RatioType,
  StatsType,
  StockType,
} from "@slippi/slippi-js";
import _ from "lodash";

interface FileInfos {
  metadatas: (MetadataType | null)[];
  settings: GameStartType[];
}

export const getInfoFromFiles = (files: FileResult[]) =>
  _.reduce(
    files,
    (result, file) => {
      return {
        metadatas: [..._.get(result, "metadatas", []), file.metadata],
        settings: [..._.get(result, "settings", []), file.settings],
      };
    },
    {},
  );

export const getPlayerIndexByUserPlayKey = (setting: GameStartType, userPlayKey: PlayKey | null) => {
  if (userPlayKey === null) {
    return -1;
  }

  return _.findIndex(
    setting.players,
    (player) => player.displayName === userPlayKey.displayName || player.connectCode === userPlayKey.connectCode,
  );
};

export const getPlayerInfoByUserPlayKey = (settings: GameStartType[], userPlayKey: PlayKey | null): PlayerType[] => {
  if (userPlayKey === null) {
    return [];
  }

  return _.map(settings, (setting) => setting.players[getPlayerIndexByUserPlayKey(setting, userPlayKey)]);
};

export const collectStatsByPlayerIndex = (stat: StatsType) => {
  const subset = {
    stocks: _.groupBy(stat.stocks, (stock) => stock.playerIndex),
    conversions: _.groupBy(stat.conversions, (conversion) => conversion.playerIndex),
    combos: _.groupBy(stat.combos, (combo) => combo.playerIndex),
    actionCounts: _.keyBy(stat.actionCounts, (actionCount) => actionCount.playerIndex),
    overall: _.keyBy(stat.overall, (overal) => overal.playerIndex),
  };

  // returns the stats grouped by the common keys of each attribute in the subset
  return _.reduce(
    subset,
    (result, value, key, _collection) => {
      const playerIndexKeys = _.keys(value);

      _.forEach(playerIndexKeys, (playerIndex) => {
        const playerIndexResult = _.get(result, playerIndex, {});
        _.set(result, playerIndex, playerIndexResult);
        _.set(playerIndexResult, key, _.get(value, playerIndex, {}));
      });

      return result;
    },
    {},
  );
};

type possibleHashType =
  | StockType
  | ConversionType
  | ComboType
  | ActionCountsType
  | OverallType
  | MoveLandedType
  | InputCountsType
  | RatioType;
export const totalGivenStats = (stats: StatsType[]) => {
  const sum = (hash: possibleHashType, initialValue?: possibleHashType) => {
    const result = (initialValue || {}) as possibleHashType;

    _.forEach(hash, (value, key) => {
      if (_.isObject(value)) {
        _.set(result, key, sum(value, _.get(result, key)));
      } else {
        const resultValue = _.get(result, key, 0);
        _.set(result, key, resultValue + value);
      }
    });

    return result;
  };

  const recalculateRatios = (hash: OverallType) =>
    _.forEach(hash, (value, _key) => {
      if (_.isObject(value) && _.has(value, "ratio")) {
        const subhash = value as RatioType;
        _.set(subhash, "ratio", subhash.count / subhash.total || null);
      }

      return hash;
    });

  const grouped = _.reduce(
    stats,
    (result, stat) => ({
      actionCounts: [stat.actionCounts, ...result.actionCounts] as ActionCountsType[],
      overall: [stat.overall, ...result.overall] as OverallType[],
    }),
    { actionCounts: [] as ActionCountsType[], overall: [] as OverallType[] },
  );

  return {
    gameComplete: true,
    lastFrame: -1,
    playableFrameCount: -1,
    stocks: _.reduce(stats, (result, stat) => [...stat.stocks, ...result], [] as StockType[]),
    conversions: _.reduce(stats, (result, stat) => [...stat.conversions, ...result], [] as ConversionType[]),
    combos: _.reduce(stats, (result, stat) => [...stat.combos, ...result], [] as ComboType[]),
    actionCounts: [
      _.reduce(
        grouped.actionCounts,
        (result, actionCount) => sum(actionCount, result),
        {} as possibleHashType,
      ) as ActionCountsType,
    ] as ActionCountsType[],
    overall: [
      recalculateRatios(
        _.reduce(grouped.overall, (result, overall) => sum(overall, result), {} as possibleHashType) as OverallType,
      ),
    ] as OverallType[],
  } as StatsType;
};

export const collectStatsByPlayer = (files: FileResult[], stats: StatsType[], userPlayKey: PlayKey | null) => {
  if (userPlayKey === null) {
    return {} as StatsType;
  }

  const { settings } = getInfoFromFiles(files) as FileInfos;
  const playerInfos = getPlayerInfoByUserPlayKey(settings, userPlayKey);
  const groupedStats = _.map(stats, (stat, index) => {
    const playerIndexForGame = _.get(playerInfos, `${[index]}.playerIndex`);
    return _.get(collectStatsByPlayerIndex(stat), playerIndexForGame, {});
  }) as StatsType[];

  return totalGivenStats(groupedStats);
};
