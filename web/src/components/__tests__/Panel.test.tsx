import { Panel } from "../Panel";
import { render } from "../../test-utils";

const defaultProps = {
  title: "Testing",
  children: <h1>TESTING</h1>,
};

describe(`${Panel.name}`, () => {
  test("should render correctly", () => {
    const component = render(<Panel {...defaultProps} />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
