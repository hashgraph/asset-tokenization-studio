import React from "react";
import { render } from "@/test-utils";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { BreadcrumbItemProps, BreadcrumbProps } from "./Breadcrumb";
import { BreadcrumbDesktop } from "./BreadcrumbDesktop";
import { customProps, defaultProps } from "./commonTests";

describe(`<BreadcrumbDesktop />`, () => {
  const factoryComponent = (props: BreadcrumbProps) =>
    render(<BreadcrumbDesktop {...props} />);

  test("renders correctly default", () => {
    const component = factoryComponent(defaultProps);

    expect(component.asFragment()).toMatchSnapshot("default");
  });

  test("renders correctly with maxItems to show", () => {
    const component = factoryComponent({ ...defaultProps, showMaxItems: true });

    expect(component.asFragment()).toMatchSnapshot("showMaxItems");
  });

  test("if showMaxItems is true should show a button to open hidden elements", async () => {
    const component = factoryComponent({ ...defaultProps, showMaxItems: true });

    const menuList = component.getByTestId("breadcrumb-dropdown");
    expect(menuList).toBeInTheDocument();
    expect(menuList).not.toBeVisible();

    const hiddenElement = component.getByText("Level 2");
    expect(hiddenElement).toBeInTheDocument();
    expect(hiddenElement).not.toBeVisible();

    const menuButton = component.getByTestId("breadcrumb-menu-button");
    expect(menuButton).toBeInTheDocument();

    await waitFor(() => {
      userEvent.click(menuButton);
      expect(menuList).toBeVisible();
      expect(hiddenElement).toBeVisible();
    });
  });

  test("should have a link for each element", async () => {
    const component = factoryComponent(defaultProps);

    const breadcrumb = component.getByTestId("breadcrumb-desktop");
    const elements = breadcrumb.getElementsByClassName(
      "chakra-breadcrumb__link"
    );

    expect(elements.length).toEqual(defaultProps.items.length);
  });

  test("renders custom links", () => {
    const component = factoryComponent(customProps);

    const { items } = customProps;

    items.forEach((item: BreadcrumbItemProps, index: number) => {
      const link = component.getByTestId(`custom-link-${index}`);
      expect(link).toBeInTheDocument();
    });
  });

  test("renders loading item", () => {
    const component = factoryComponent({
      ...defaultProps,
      items: [
        ...defaultProps.items,
        {
          label: "Loading",
          link: "/loading",
          isLoading: true,
        },
      ],
    });

    const loadingItem = component.getByTestId("breadcrumb-loading-item");
    expect(loadingItem).toBeInTheDocument();
  });
});
