import React from "react";
import {
  Breadcrumb as ChakraBreadcrumb,
  BreadcrumbItem as ChakraBreadcrumbItem,
  BreadcrumbLink as ChakraBreadcrumbLink,
  BreadcrumbSeparator as ChakraBreadcrumbSeparator,
  Skeleton as ChakraSkeleton,
} from "@chakra-ui/react";

import type { ComponentWithAs } from "@chakra-ui/system";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { omit as _omit } from "lodash";
import { CaretLeft } from "@phosphor-icons/react";
import type { BreadcrumbProps } from "./Breadcrumb";

export const BreadcrumbMobile: ComponentWithAs<"div", BreadcrumbProps> =
  forwardRef<BreadcrumbProps, "div">((props: BreadcrumbProps, ref) => {
    const { items, variant } = props;
    const item = items[items.length - 2];
    const styles = useChakraMultiStyleConfig("Breadcrumb", {
      variant,
    });
    const containerProps = _omit(props, [
      "buttonLabel",
      "items",
      "showMaxItems",
      "variant",
    ]);

    return (
      <ChakraBreadcrumb
        data-testid="breadcrumb-mobile"
        ref={ref}
        separator={<PhosphorIcon as={CaretLeft} />}
        sx={styles.container}
        {...containerProps}
      >
        <ChakraBreadcrumbItem key={item.label} sx={styles.item}>
          <ChakraBreadcrumbSeparator ml={0} sx={styles.separator} />
          {item.isLoading ? (
            <ChakraSkeleton
              data-testid="breadcrumb-loading-item"
              minH={2}
              minW={20}
            />
          ) : (
            <ChakraBreadcrumbLink
              data-testid="breadcrumb-link"
              {...(typeof item.link === "string"
                ? { href: item.link }
                : { ...item.link })}
              sx={styles.link}
            >
              {item.label}
            </ChakraBreadcrumbLink>
          )}
        </ChakraBreadcrumbItem>
      </ChakraBreadcrumb>
    );
  });
