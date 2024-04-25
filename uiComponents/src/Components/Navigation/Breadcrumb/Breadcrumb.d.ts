import type { breadcrumbAnatomy as ChakraBreadcrumbParts } from "@chakra-ui/anatomy";
import type { BreadcrumbProps as ChakraBreadcrumProps } from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject, ComponentWithAs } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
export interface BreadcrumbItemProps {
    label: string;
    link: string | Record<string, unknown> | null;
    isLoading?: boolean;
}
export interface BreadcrumbProps extends ChakraBreadcrumProps {
    items: BreadcrumbItemProps[];
    showMaxItems?: boolean;
}
export declare const breadcrumbPartsList: Array<(typeof ChakraBreadcrumbParts.keys)[number] | "isDesktop" | "menu">;
type Parts = typeof breadcrumbPartsList;
export type BreadcrumbThemeStyle = Record<Parts[number], ChakraSystemStyleObject> & {
    isDesktop: Record<string, boolean>;
};
export interface BreadcrumbThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
    baseStyle: Partial<BreadcrumbThemeStyle>;
}
export declare const Breadcrumb: ComponentWithAs<"div", BreadcrumbProps>;
export {};
