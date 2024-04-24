import type { AlertProps as ChakraAlertProps } from "@chakra-ui/alert";
import {
  Alert as ChakraAlert,
  AlertDescription as ChakraAlertDescription,
} from "@chakra-ui/alert";
import type { alertAnatomy as ChakraAlertParts } from "@chakra-ui/anatomy";
import {
  Box as ChakraBox,
  Flex as ChakraFlex,
  Center as ChakraCenter,
} from "@chakra-ui/layout";
import type { ComponentWithAs, SystemStyleObject } from "@chakra-ui/system";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import React from "react";
import type {
  BaseMultiStyleConfiguration,
  PartsStyleInterpolation,
} from "@Theme/Components/BaseMultiStyleConfiguration";
import { Text } from "@/Components/Foundations/Text";
import { CloseButton } from "@Components/Interaction/CloseButton";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import type { PhosphorIconProps } from "@/Components/Foundations/PhosphorIcon";

type UnionKeys<T> = T extends T ? keyof T : never;
type StrictUnionHelper<T, TAll> = T extends any
  ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>>
  : never;

type StrictUnion<T> = StrictUnionHelper<T, T>;
export interface BaseAlertProps
  extends Omit<ChakraAlertProps, "children" | "title" | "status"> {
  isInline?: boolean;
  onClose?(): void;
  showIcon?: boolean;
  status?: AlertStatus;
}
export interface CustomChildrenAlertProps {
  children: React.ReactNode;
}

export interface TitleDescriptionAlertProps {
  title?: string;
  description?: string;
}

export type AlertProps = BaseAlertProps &
  StrictUnion<TitleDescriptionAlertProps | CustomChildrenAlertProps>;

export const alertPartsList: Array<
  (typeof ChakraAlertParts.keys)[number] | "closeBtn" | "contentContainer"
> = [
  "container",
  "contentContainer",
  "title",
  "description",
  "icon",
  "spinner",
  "closeBtn",
];

type Parts = typeof alertPartsList;

export type AlertStatus = "success" | "warning" | "error" | "info" | "loading";

export interface AlertThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle:
    | (({ status }: { status: AlertStatus }) => Partial<AlertThemeStyle>)
    | PartsStyleInterpolation<Parts>;
}

type AlertThemeStyle = Record<Parts[number], SystemStyleObject> & {
  icon: PhosphorIconProps;
};

export const Alert: ComponentWithAs<"div", AlertProps> = forwardRef<
  AlertProps,
  "div"
>(
  (
    {
      children,
      status = "info",
      showIcon = true,
      isInline = true,
      onClose,
      variant,
      ...props
    }: AlertProps,
    ref
  ) => {
    const styles = useChakraMultiStyleConfig("Alert", {
      variant,
      status,
    }) as AlertThemeStyle;

    const { weight, as: IconComponent, ...restIconStyles } = styles.icon;
    const Icon = React.useMemo(
      () =>
        status === "loading" ? (
          <ChakraCenter sx={restIconStyles}>
            {React.cloneElement(IconComponent, {
              size: "xxs",
              color: restIconStyles["__css"]?.color,
            })}
          </ChakraCenter>
        ) : (
          <PhosphorIcon {...styles.icon} weight={weight} />
        ),
      [status, restIconStyles, IconComponent, weight, styles.icon]
    );

    return (
      <ChakraAlert ref={ref} status={status} {...props} sx={styles.container}>
        <ChakraFlex w="full" h="full" sx={styles.contentContainer}>
          {showIcon && Icon}
          {children ? (
            <ChakraBox flex={1}>{children}</ChakraBox>
          ) : (
            <ChakraFlex
              data-testid="alert-content"
              direction={isInline ? "row" : "column"}
              flex={1}
            >
              <ChakraAlertDescription sx={styles.description}>
                <Text as="span">
                  {props.title && (
                    <Text as="span" sx={styles.title}>
                      {props.title}
                    </Text>
                  )}
                  {props.description}
                </Text>
              </ChakraAlertDescription>
            </ChakraFlex>
          )}
        </ChakraFlex>
        {onClose && (
          <CloseButton sx={styles.closeBtn} onClick={onClose} size={"xs"} />
        )}
      </ChakraAlert>
    );
  }
);
