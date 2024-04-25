import type { CSSProperties } from "react";
import type { SystemCSSProperties as ChakraSystemCSSProperties } from "@chakra-ui/system";
export type LogoSize = "full" | "iso";
export declare const logoPartsList: Array<"fullImage" | "isoImage">;
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
export declare const Logo: ({ size, variant, width, height, customStyle, alt, }: LogoProps) => JSX.Element;
export {};
