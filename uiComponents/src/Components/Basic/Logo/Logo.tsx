import type { CSSProperties } from "react";
import React from "react";
import type { SystemCSSProperties as ChakraSystemCSSProperties } from "@chakra-ui/system";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";

export type LogoSize = "full" | "iso";

export const logoPartsList: Array<"fullImage" | "isoImage"> = [
  "fullImage",
  "isoImage",
];

type Parts = typeof logoPartsList;

export interface LogoThemeConfiguration {
  baseStyle?: Record<Parts[number], any>;
  variants?: Record<Parts[number], any>;
}

export type LogoThemeStyle = {
  fullImage: string;
  isoImage: string;
};

export interface LogoProps {
  size?: LogoSize;
  variant?: string;
  width?: ChakraSystemCSSProperties["width"];
  height?: ChakraSystemCSSProperties["height"];
  alt: string;
  customStyle?: CSSProperties;
}

export const Logo = ({
  size = "full",
  variant,
  width = "auto",
  height = "auto",
  customStyle,
  alt,
}: LogoProps) => {
  const { fullImage, isoImage } = useChakraMultiStyleConfig("Logo", {
    variant,
  }) as LogoThemeStyle;
  const srcBySize: { [key in LogoSize]: string } = {
    full: fullImage,
    iso: isoImage,
  };

  return (
    <img
      alt={alt}
      src={srcBySize[size]}
      style={{ width, height, ...customStyle }}
    />
  );
};
