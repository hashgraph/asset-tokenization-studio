import { render } from "@/test-utils";
import { fireEvent } from "@testing-library/react";
import React from "react";
import type { PageTitleProps } from "@Components/Navigation/PageTitle";
import { PageTitle } from "@Components/Navigation/PageTitle";

describe("<PageTitle/>", () => {
  const defaultText = "Content of the button";
  const defaultProps: PageTitleProps = {
    title: defaultText,
  };

  const factoryComponent = (props?: Partial<PageTitleProps>) =>
    render(<PageTitle {...defaultProps} {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
    expect(component.getByText(defaultText)).toBeVisible();
  });

  test("Should not render IconButton ", () => {
    const component = factoryComponent({
      ...defaultProps,
    });

    expect(component.queryByRole("button")).not.toBeInTheDocument();
  });

  test("Should call onClickBack function ", () => {
    const props = {
      ...defaultProps,
      onGoBack: jest.fn(),
    };
    const component = factoryComponent({
      ...props,
    });

    fireEvent.click(component.getByRole("button"));

    expect(props.onGoBack).toBeCalledTimes(1);
  });
  test("Should render loading skeleton ", () => {
    const component = factoryComponent({
      isLoading: true,
    });

    expect(component.container).toMatchSnapshot("WithLoading");
  });
});
