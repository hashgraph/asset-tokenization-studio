import React from "react";
import type { breadcrumbAnatomy as ChakraBreadcrumbParts } from "@chakra-ui/anatomy";
import type { BreadcrumbProps as ChakraBreadcrumProps } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import type {
  SystemStyleObject as ChakraSystemStyleObject,
  ComponentWithAs,
} from "@chakra-ui/system";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import { BreadcrumbDesktop } from "./BreadcrumbDesktop";
import { BreadcrumbMobile } from "./BreadcrumbMobile";
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

export const breadcrumbPartsList: Array<
  (typeof ChakraBreadcrumbParts.keys)[number] | "isDesktop" | "menu"
> = ["container", "isDesktop", "item", "menu", "link", "separator"];

type Parts = typeof breadcrumbPartsList;

export type BreadcrumbThemeStyle = Record<
  Parts[number],
  ChakraSystemStyleObject
> & {
  isDesktop: Record<string, boolean>;
};

export interface BreadcrumbThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle: Partial<BreadcrumbThemeStyle>;
}

export const Breadcrumb: ComponentWithAs<"div", BreadcrumbProps> = forwardRef<
  BreadcrumbProps,
  "div"
>((props: BreadcrumbProps, ref) => {
  const { isDesktop: breakpoint } = useChakraMultiStyleConfig("Breadcrumb");
  const isDesktop = useBreakpointValue(breakpoint);

  if (isDesktop) {
    return <BreadcrumbDesktop ref={ref} {...props} />;
  }

  return <BreadcrumbMobile ref={ref} {...props} />;
});
