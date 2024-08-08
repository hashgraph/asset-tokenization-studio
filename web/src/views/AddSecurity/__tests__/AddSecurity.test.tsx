import { AddSecurity } from "../AddSecurity";
import { render } from "../../../test-utils";

describe(`${AddSecurity.name}`, () => {
  test("should render correctly", () => {
    const component = render(<AddSecurity />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
