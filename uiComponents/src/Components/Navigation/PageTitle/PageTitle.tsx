import React from "react";
import type { BaseMultiStyleConfiguration } from "@Theme/Components/BaseMultiStyleConfiguration";
import type { FlexProps } from "@chakra-ui/react";
import {
  Flex,
  SkeletonText,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/react";
import { ArrowLeft } from "@phosphor-icons/react";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import type { TextProps } from "@/Components/Foundations/Text";
import { Text } from "@/Components/Foundations/Text";
import type {
  IconButtonProps,
  IconButtonThemeConfiguration,
} from "@Components/Interaction/IconButton";
import { IconButton } from "@Components/Interaction/IconButton";

export const pageTitlePartsList: Array<
  "backButton" | "textTitle" | "container"
> = ["backButton", "textTitle", "container"];

type Parts = typeof pageTitlePartsList;

export interface PageTitleThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  backButton?: IconButtonThemeConfiguration;
}

type PageTitleThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;

export interface PageTitleProps extends Omit<FlexProps, "children"> {
  title?: string;
  onGoBack?: () => void;
  backButtonProps?: Omit<IconButtonProps, "icon" | "variant">;
  titleProps?: TextProps;
  isLoading?: boolean;
}

export const PageTitle = ({
  title,
  onGoBack,
  backButtonProps,
  titleProps,
  isLoading,
}: PageTitleProps) => {
  const styles = useChakraMultiStyleConfig("PageTitle") as PageTitleThemeStyle;

  return (
    <Flex sx={styles.container}>
      {onGoBack && (
        <IconButton
          sx={styles.backButton}
          icon={<PhosphorIcon as={ArrowLeft} size="xxs" />}
          aria-label="Go back"
          onClick={onGoBack}
          variant="secondary"
          size="md"
          {...backButtonProps}
        />
      )}
      {isLoading ? (
        <SkeletonText skeletonHeight={6} noOfLines={1} minWidth={25} />
      ) : (
        <Text sx={styles.textTitle} {...titleProps}>
          {title}
        </Text>
      )}
    </Flex>
  );
};
