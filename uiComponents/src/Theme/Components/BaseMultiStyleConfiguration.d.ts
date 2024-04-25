import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import type { ComponentMultiStyleConfig as ChakraComponentMultiStyleConfig, ThemingPropsThunk as ChakraThemingPropsThunk } from "@chakra-ui/theme";
export type PartsStyleInterpolation<TParts extends string[]> = Partial<Record<TParts[number], ChakraThemingPropsThunk<ChakraSystemStyleObject>>>;
export interface BaseMultiStyleConfiguration<TParts extends string[]> extends Omit<ChakraComponentMultiStyleConfig, "parts" | "sizes" | "baseStyle" | "variants"> {
    parts: TParts;
    sizes?: Record<string, PartsStyleInterpolation<TParts>> | Record<string, (args: any) => PartsStyleInterpolation<TParts>>;
    variants?: Record<string, PartsStyleInterpolation<TParts>> | Record<string, (args: any) => PartsStyleInterpolation<TParts>>;
    baseStyle?: PartsStyleInterpolation<TParts> | ((args: any) => PartsStyleInterpolation<TParts>);
}
