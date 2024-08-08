import React from "react";
import { Weight } from "@/Components/Foundations/PhosphorIcon";
import { usePopupContext } from "../context/PopupContext";
import type { PopUpProps } from "../types";

export type PoupIconProps = Required<Pick<PopUpProps, "icon">>;

export const PopUpIcon = ({ icon }: PoupIconProps) => {
  const { styles } = usePopupContext();

  return React.cloneElement(icon, {
    sx: {
      ...styles.icon,
    },
    weight: Weight.Fill,
    size: "md",
    ...icon.props,
  });
};
