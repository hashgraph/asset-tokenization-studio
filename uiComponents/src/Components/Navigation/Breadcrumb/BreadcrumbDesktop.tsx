import React from "react";
import {
  Breadcrumb as ChakraBreadcrumb,
  BreadcrumbItem as ChakraBreadcrumbItem,
  BreadcrumbLink as ChakraBreadcrumbLink,
  Link as ChakraLink,
  Menu,
  MenuButton,
  Skeleton as ChakraSkeleton,
} from "@chakra-ui/react";
import type { ComponentWithAs } from "@chakra-ui/system";
import {
  forwardRef,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/system";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { omit as _omit } from "lodash";
import { CaretRight, DotsThree } from "@phosphor-icons/react";
import type { BreadcrumbProps } from "./Breadcrumb";
import { Dropdown, DropdownItem } from "@Components/DataDisplay/Dropdown";

const DEFAULT_MENU_BUTTON_LABEL = "...";

const HiddenItems = ({ items }: { items: BreadcrumbProps["items"] }) => {
  const { menu } = useChakraMultiStyleConfig("Breadcrumb");

  return (
    <Menu data-testid="breadcrumb-menu">
      <MenuButton data-testid="breadcrumb-menu-button" sx={menu}>
        <PhosphorIcon as={DotsThree} size="xs" />
      </MenuButton>
      <Dropdown data-testid="breadcrumb-dropdown">
        {items?.map((item) => (
          <DropdownItem
            label={item.label}
            key={item.label}
            {...(typeof item.link === "string"
              ? { as: ChakraLink, href: item.link }
              : { ...item.link })}
          >
            {item.label}
          </DropdownItem>
        ))}
      </Dropdown>
    </Menu>
  );
};

export const BreadcrumbDesktop: ComponentWithAs<"div", BreadcrumbProps> =
  forwardRef<BreadcrumbProps, "div">((props: BreadcrumbProps, ref) => {
    const { items, showMaxItems, variant } = props;
    const styles = useChakraMultiStyleConfig("Breadcrumb", {
      variant,
    });
    const containerProps = _omit(props, ["items", "showMaxItems", "variant"]);

    const getCustomList = () => {
      const hiddenItems = {
        as: HiddenItems,
        items: items.slice(2, -2),
      };

      const list = [
        ...items.slice(0, 2),
        { label: DEFAULT_MENU_BUTTON_LABEL, link: hiddenItems },
        ...items.slice(-2),
      ];

      return list;
    };

    const customList = showMaxItems ? getCustomList() : items;

    return (
      <ChakraBreadcrumb
        data-testid="breadcrumb-desktop"
        ref={ref}
        separator={<PhosphorIcon as={CaretRight} />}
        spacing={2}
        sx={styles.container}
        {...containerProps}
      >
        {customList.map((item, index) => (
          <ChakraBreadcrumbItem
            isCurrentPage={customList.length === index + 1}
            key={item.label}
            sx={styles.item}
          >
            {item.isLoading ? (
              <ChakraSkeleton
                data-testid="breadcrumb-loading-item"
                minH={2}
                minW={20}
              />
            ) : (
              <ChakraBreadcrumbLink
                {...(typeof item.link === "string"
                  ? { href: item.link }
                  : { ...item.link })}
                sx={styles.link}
              >
                {item.label}
              </ChakraBreadcrumbLink>
            )}
          </ChakraBreadcrumbItem>
        ))}
      </ChakraBreadcrumb>
    );
  });
