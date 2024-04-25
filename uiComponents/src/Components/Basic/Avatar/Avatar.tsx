import { type avatarAnatomy as ChakraAvatarParts } from "@chakra-ui/anatomy";
import {
  Avatar as ChakraAvatar,
  AvatarBadge as ChakraAvatarBadge,
  type AvatarProps as ChakraAvatarProps,
} from "@chakra-ui/avatar";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import type {
  SystemStyleObject as ChakraSystemStyleObject,
  ComponentWithAs,
} from "@chakra-ui/system";
import { SkeletonCircle as ChakraSkeletonCircle } from "@chakra-ui/react";
import { User } from "@phosphor-icons/react";
import React from "react";
import type {
  PartsStyleInterpolation,
  BaseMultiStyleConfiguration,
} from "../../../Theme/Components/BaseMultiStyleConfiguration";
import { PhosphorIcon, Weight } from "../../Foundations/PhosphorIcon";

export const avatarPartsList: typeof ChakraAvatarParts.keys = [
  "container",
  "badge",
  "label",
  "group",
  "excessLabel",
];

type Parts = typeof avatarPartsList;

export interface AvatarThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle:
    | (({
        name,
        badgeColor,
      }: {
        badgeColor?: string;
        name?: string;
      }) => Partial<AvatarThemeStyle>)
    | PartsStyleInterpolation<Parts>;
}

type AvatarThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;
export interface AvatarProps extends Omit<ChakraAvatarProps, "children"> {
  showBadge?: boolean;
  badgeColor?: string;
  isLoading?: boolean;
}

export const Avatar: ComponentWithAs<"span", AvatarProps> = forwardRef<
  AvatarProps,
  "span"
>(
  (
    {
      showBadge = false,
      badgeColor,
      size,
      name,
      src,
      variant,
      isLoading,
      ...props
    }: AvatarProps,
    ref
  ) => {
    const styles = useChakraMultiStyleConfig("Avatar", {
      name: name && !src,
      size,
      badgeColor,
      variant,
    }) as AvatarThemeStyle;

    if (isLoading) {
      return (
        <ChakraSkeletonCircle sx={styles.container} size={size} {...props} />
      );
    }

    return (
      <ChakraAvatar
        ref={ref}
        name={name}
        src={src}
        sx={styles.container}
        variant={variant}
        icon={<PhosphorIcon weight={Weight.Regular} size="sm" as={User} />}
        {...props}
      >
        {showBadge && <ChakraAvatarBadge sx={styles.badge} />}
      </ChakraAvatar>
    );
  }
);
