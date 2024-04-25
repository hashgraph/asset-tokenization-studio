import type { FlexProps as ChakraFlexProps } from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import React from "react";
export declare const detailReviewPartsList: Array<"title" | "value" | "container">;
type Parts = typeof detailReviewPartsList;
export type DetailReviewThemeConfiguration = BaseMultiStyleConfiguration<Parts>;
export interface DetailReviewProps extends ChakraFlexProps {
    title: string;
    value: string | number | React.ReactElement;
    isLoading?: boolean;
}
export type DetailReviewThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;
export declare const DetailReview: ({ title, value, isLoading, ...props }: DetailReviewProps) => JSX.Element;
export {};
