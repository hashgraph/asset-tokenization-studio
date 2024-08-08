import type { FlexProps as ChakraFlexProps } from "@chakra-ui/react";
import {
  Box,
  Flex as ChakraFlex,
  SkeletonText,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import { Text } from "../../Foundations/Text";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import React from "react";

export const detailReviewPartsList: Array<"title" | "value" | "container"> = [
  "title",
  "value",
  "container",
];

type Parts = typeof detailReviewPartsList;

export type DetailReviewThemeConfiguration = BaseMultiStyleConfiguration<Parts>;

export interface DetailReviewProps extends ChakraFlexProps {
  title: string;
  value: string | number | React.ReactElement;
  isLoading?: boolean;
}

export type DetailReviewThemeStyle = Record<
  Parts[number],
  ChakraSystemStyleObject
>;

export const DetailReview = ({
  title,
  value,
  isLoading,
  ...props
}: DetailReviewProps) => {
  const styles = useChakraMultiStyleConfig(
    "DetailReview"
  ) as DetailReviewThemeStyle;

  return (
    <ChakraFlex {...props} sx={styles.container}>
      <Text sx={styles.title}>{title}</Text>
      {isLoading ? (
        <SkeletonText skeletonHeight={4} noOfLines={1} />
      ) : (
        <>
          {React.isValidElement(value) ? (
            <Box sx={styles.value}>{value}</Box>
          ) : (
            <Text sx={styles.value}>{value}</Text>
          )}
        </>
      )}
    </ChakraFlex>
  );
};
