import React from "react";
import { Text } from "@chakra-ui/react";
import { usePopupContext } from "../context/PopupContext";

export interface PopupTextProps {
  type?: "title" | "description";
  label: string | React.ReactNode;
}

export const PopUpText = ({ type = "title", label }: PopupTextProps) => {
  const { styles: popUpStyles } = usePopupContext();

  const { [type]: styles } = popUpStyles;

  if (typeof label === "object" || React.isValidElement(label)) {
    return <>{label}</>;
  }

  return <Text sx={styles}>{label}</Text>;
};
