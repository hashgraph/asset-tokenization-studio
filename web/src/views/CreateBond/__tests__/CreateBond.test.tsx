import { CreateBond } from "../CreateBond";
import { render } from "../../../test-utils";

describe(`${CreateBond.name}`, () => {
  test("render correctly", () => {
    const component = render(<CreateBond />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
