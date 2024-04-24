import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  forwardRef,
  useMultiStyleConfig,
} from "@chakra-ui/react";
import type { ButtonProps as ChakraButtonProps } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import _merge from "lodash/merge";
import type {
  ComponentWithAs,
  SystemStyleObject as ChakraSystemStyleObject,
} from "@chakra-ui/system";
import { Check } from "@phosphor-icons/react";
import { PhosphorIcon, Weight } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { Tooltip } from "@Components/Overlay/Tooltip";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";

export const cardButtonPartsList: Array<
  "container" | "content" | "icon" | "text" | "check" | "tooltip"
> = ["container", "content", "icon", "text", "check", "tooltip"];

type Parts = typeof cardButtonPartsList;

export interface CardButtonThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

export type CardButtonThemeStyle = Record<
  Parts[number],
  ChakraSystemStyleObject
>;

export interface CardButtonProps extends ChakraButtonProps {
  icon: React.ReactElement;
  text: string;
  isSelected?: boolean;
}

export const CardButton: ComponentWithAs<"button", CardButtonProps> =
  forwardRef<CardButtonProps, "button">(
    ({ icon, text, isSelected, sx, ...props }: CardButtonProps, ref) => {
      const themeStyles = useMultiStyleConfig("CardButton", {
        isSelected,
      }) as CardButtonThemeStyle;

      const styles = React.useMemo(
        () => _merge(themeStyles, sx),
        [themeStyles, sx]
      );

      const textRef = useRef<HTMLParagraphElement | null>(null);

      const [isOverflowed, setIsOverflowed] = useState<boolean>(false);

      useEffect(() => {
        if (textRef.current) {
          setIsOverflowed(
            textRef.current.scrollWidth > textRef.current.clientWidth
          );
        }
      }, []);

      return (
        <Tooltip
          data-testid="card-button-tooltip"
          label={text}
          isDisabled={!isOverflowed}
          gutter={-10}
          sx={styles.tooltip}
        >
          <ChakraButton
            data-testid="card-button-button"
            ref={ref}
            sx={styles.container}
            {...props}
          >
            <ChakraFlex sx={styles.content}>
              {isSelected && (
                <ChakraFlex
                  data-testid="card-button-check-container"
                  sx={styles.check}
                >
                  <PhosphorIcon as={Check} size="xxs" />
                </ChakraFlex>
              )}
              <CardButtonIcon icon={icon} />
              <Text ref={textRef} sx={styles.text}>
                {text}
              </Text>
            </ChakraFlex>
          </ChakraButton>
        </Tooltip>
      );
    }
  );

export const CardButtonIcon = ({
  icon,
}: Required<Pick<CardButtonProps, "icon">>) => {
  const styles = useMultiStyleConfig("CardButton", {});

  return React.cloneElement(icon, {
    sx: { ...styles.icon },
    weight: Weight.Regular,
    size: "md",
    ...icon.props,
  });
};
