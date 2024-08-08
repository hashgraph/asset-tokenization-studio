import { render } from "@/test-utils";
import type { DetailReviewProps } from "./DetailReview";
import { DetailReview } from "./DetailReview";
import React from "react";

const defaultProps = {
  title: "Example",
  value: "This is the value",
};

describe(`< ${DetailReview.name} />`, () => {
  const factoryComponent = (props: DetailReviewProps = defaultProps) =>
    render(<DetailReview {...props} />);

  test("should render correctly", () => {
    const component = factoryComponent();
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should show title & value", () => {
    const component = factoryComponent();
    expect(component.getByText(defaultProps.title)).toBeInTheDocument();
    expect(component.getByText(defaultProps.value)).toBeInTheDocument();
  });

  test("should show skeleton when isLoading is true", () => {
    const component = factoryComponent({ isLoading: true, ...defaultProps });
    expect(component.container).toMatchSnapshot("WithLoading");
  });
});
