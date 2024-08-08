import { theme as chakraTheme } from "@chakra-ui/react";
import _ from "lodash";
import NeutralColors from "./neutralColors";
import StatusColors from "./statusColors";
import MainColors from "./mainColors";
import AlternativesColors from "./alternativesColors";

export { default as StatusColors } from "./statusColors";
export { default as MainColors } from "./mainColors";
export { default as NeutralColors } from "./neutralColors";
export { default as AlternativesColors } from "./alternativesColors";

export type MainColorsType = keyof typeof MainColors;

export type StatusColorsType = keyof typeof StatusColors;

export const getListFromColors = (colors: any) => {
  return Object.keys(colors).map((key) => ({
    title: key === "white" ? "Neutral" : camelToFlat(key),
    subtitle: colors[key][500] ? `Base color: ${key}.500` : "",
    key,
    colors: _.isObject(colors[key]) ? colors[key] : [colors[key]],
  }));
};

export const capitalize = (s: string) => {
  if (typeof s !== "string") return "";
  return _.camelCase(s);
};

export const camelToFlat = (s: string) => {
  if (typeof s !== "string") return "";

  return _.startCase(s)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

export const colors = {
  ...chakraTheme.colors,
  ...NeutralColors,
  ...StatusColors,
  ...MainColors,
  ...AlternativesColors,
};

export type ColorScheme = keyof typeof colors;
