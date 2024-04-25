import { type avatarAnatomy as ChakraAvatarParts } from "@chakra-ui/anatomy";
import { type AvatarProps as ChakraAvatarProps } from "@chakra-ui/avatar";
import type { SystemStyleObject as ChakraSystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
import type { PartsStyleInterpolation, BaseMultiStyleConfiguration } from "../../../Theme/Components/BaseMultiStyleConfiguration";
export declare const avatarPartsList: typeof ChakraAvatarParts.keys;
type Parts = typeof avatarPartsList;
export interface AvatarThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: (({ name, badgeColor, }: {
        badgeColor?: string;
        name?: string;
    }) => Partial<AvatarThemeStyle>) | PartsStyleInterpolation<Parts>;
}
type AvatarThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;
export interface AvatarProps extends Omit<ChakraAvatarProps, "children"> {
    showBadge?: boolean;
    badgeColor?: string;
    isLoading?: boolean;
}
export declare const Avatar: ComponentWithAs<"span", AvatarProps>;
export {};
