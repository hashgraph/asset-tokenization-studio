import type { FlexProps } from "@chakra-ui/react";
import React from "react";
import type { AddAreaButtonProps } from "./AddAreaButton";
declare const meta: import("@storybook/types").ComponentAnnotations<import("@storybook/react/dist/types-0a347bb9").R, import("@chakra-ui/system/dist/system.types").MergeWithAs<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, any, AddAreaButtonProps, import("@chakra-ui/system/dist/system.types").As>>;
export default meta;
interface AddAreaButtonInContainer extends AddAreaButtonProps {
    containerWidth: FlexProps["width"];
}
export declare const Default: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, AddAreaButtonInContainer>;
