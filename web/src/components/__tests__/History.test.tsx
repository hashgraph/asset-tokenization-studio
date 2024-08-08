import { History, HistoryProps } from "../History";
import { render } from "../../test-utils";

const defaultProps: HistoryProps = {
  label: "Go Back",
};

describe(`${History.name}`, () => {
  test("should render correctly", () => {
    const component = render(<History {...defaultProps} />);

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should have a goback button", () => {
    const component = render(<History {...defaultProps} />);

    expect(component.getByTestId("go-back-button")).toBeInTheDocument();
  });

  test("should have a breadcrumb", () => {
    const component = render(<History {...defaultProps} />);

    expect(component.getByTestId("breadcrumb-desktop")).toBeInTheDocument();
  });
});
