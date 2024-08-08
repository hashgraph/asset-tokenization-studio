/*eslint import/namespace: ['error', { allowComputed: true }]*/
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import * as Icons from "@phosphor-icons/react";
import React from "react";
export const iconList = ["none", ...Object.keys(Icons)];

export const iconLabels = iconList.map((iconName) => ({
  [iconName]: iconName === "none" ? undefined : iconName,
}));

export const mappedIcons = iconList.reduce((acc, iconName) => {
  const iconKey =
    iconName === "none" ? undefined : (iconName as keyof typeof Icons);
  if (iconKey) {
    acc[iconName] = <PhosphorIcon as={Icons[iconKey]} />;
  } else {
    acc[iconName] = null;
  }
  return acc;
}, {} as any);
