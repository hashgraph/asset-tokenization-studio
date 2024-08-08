import React from "react";
import { render } from "@/test-utils";
import type { BreadcrumbProps } from "./Breadcrumb";
import { BreadcrumbMobile } from "./BreadcrumbMobile";
import { defaultProps } from "./commonTests";

describe(`<BreadcrumbMobile />`, () => {
  const factoryComponent = (props: BreadcrumbProps) =>
    render(<BreadcrumbMobile {...props} />);

  test("renders correctly default", () => {
    const component = factoryComponent(defaultProps);

    expect(component.asFragment()).toMatchSnapshot("default");
  });

  test("should only show second last level", () => {
    const component = factoryComponent(defaultProps);

    const indexToShow = defaultProps.items.length - 2;

    defaultProps.items.forEach((item, index) => {
      const breadcrumb = component.getByTestId("breadcrumb-mobile");
      if (index === indexToShow) {
        expect(breadcrumb).toHaveTextContent(item.label);
      } else {
        expect(breadcrumb).not.toHaveTextContent(item.label);
      }
    });
  });

  test("should have a link", () => {
    const component = factoryComponent(defaultProps);

    const link = component.getByTestId("breadcrumb-link");
    expect(link).toBeInTheDocument();
  });

  test("renders loading item", () => {
    const component = factoryComponent({
      ...defaultProps,
      items: [
        {
          label: "Loading",
          link: "/loading",
        },
        {
          label: "Loading",
          link: "/loading",
          isLoading: true,
        },
        {
          label: "Loading",
          link: "/loading",
        },
      ],
    });

    const loadingItem = component.getByTestId("breadcrumb-loading-item");
    expect(loadingItem).toBeInTheDocument();
  });
});
