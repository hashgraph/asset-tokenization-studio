import { Flex as ChakraFlex } from "@chakra-ui/layout";
import React from "react";
import { Text } from "@/Components/Foundations/Text";
import { useTableContext } from "../Table";

export interface MultiTextCellProps {
  text: string | number | React.ReactElement;
  subtext: string | number;
  type: "upper" | "lower";
}
export const MultiTextCell = ({ text, subtext, type }: MultiTextCellProps) => {
  const { styles } = useTableContext();
  return (
    <ChakraFlex direction="column">
      {type === "upper" && <Text sx={styles.subtext}>{subtext}</Text>}
      {React.isValidElement(text) ? text : <Text>{text}</Text>}
      {type === "lower" && <Text sx={styles.subtext}>{subtext}</Text>}
    </ChakraFlex>
  );
};
