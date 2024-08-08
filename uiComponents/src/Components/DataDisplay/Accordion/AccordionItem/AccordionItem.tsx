import type { AccordionItemProps as ChakraAccordionItemProps } from "@chakra-ui/react";
import {
  AccordionIcon as ChakraAccordionIcon,
  AccordionItem as ChakraAccordionItem,
  AccordionButton as ChakraAccordionButton,
  AccordionPanel as ChakraAccordionPanel,
} from "@chakra-ui/react";
import { Box as ChakraBox } from "@chakra-ui/layout";
import type {
  SystemStyleObject as ChakraSystemStyleObject,
  ComponentWithAs,
} from "@chakra-ui/system";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import React from "react";
import type {
  BaseMultiStyleConfiguration,
  PartsStyleInterpolation,
} from "@/Theme/Components/BaseMultiStyleConfiguration";

export interface AccordionItemProps
  extends Omit<ChakraAccordionItemProps, "children" | "title"> {
  children: React.ReactNode;
  title?: React.ReactNode;
  icon?: any;
  customTitle?: React.ReactNode;
}

const accordionItemPartsList: Array<string> = ["button", "item", "panel"];

type Parts = typeof accordionItemPartsList;

export interface AccordionItemThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle:
    | (() => Partial<AccordionItemThemeStyle>)
    | PartsStyleInterpolation<Parts>;
}

type AccordionItemThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;

export const AccordionItem: ComponentWithAs<"div", AccordionItemProps> =
  forwardRef<AccordionItemProps, "div">(
    (
      { children, customTitle, title, icon, ...props }: AccordionItemProps,
      ref
    ) => {
      const styles = useChakraMultiStyleConfig("AccordionItem");

      return (
        <ChakraAccordionItem ref={ref} {...props} sx={styles.container}>
          {title && (
            <h2>
              <ChakraAccordionButton sx={styles.button}>
                <ChakraBox sx={styles.title}>{title}</ChakraBox>
                <ChakraAccordionIcon {...(icon && { as: icon })} />
              </ChakraAccordionButton>
            </h2>
          )}
          {customTitle && <ChakraBox w="full">{customTitle}</ChakraBox>}
          <ChakraAccordionPanel sx={styles.panel}>
            {children}
          </ChakraAccordionPanel>
        </ChakraAccordionItem>
      );
    }
  );
