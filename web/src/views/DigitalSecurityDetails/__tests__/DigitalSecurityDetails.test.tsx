import { DigitalSecurityDetails } from "../DigitalSecurityDetails";
import { render } from "../../../test-utils";

describe(`${DigitalSecurityDetails.name}`, () => {
  test("render correctly", () => {
    const component = render(<DigitalSecurityDetails />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
