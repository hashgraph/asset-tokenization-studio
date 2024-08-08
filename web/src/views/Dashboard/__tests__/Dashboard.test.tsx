import { Dashboard } from "../Dashboard";
import { render } from "../../../test-utils";

describe(`${Dashboard.name}`, () => {
  test("render correctly", () => {
    const component = render(<Dashboard />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
