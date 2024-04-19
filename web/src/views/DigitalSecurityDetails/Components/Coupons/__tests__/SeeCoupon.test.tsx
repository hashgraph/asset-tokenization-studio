import { SeeCoupon } from "../SeeCoupon";
import { render } from "../../../../../test-utils";

// TODO Improve tests when it is connected to SDK
describe(`${SeeCoupon.name}`, () => {
  test("should render correctly", () => {
    const component = render(<SeeCoupon />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
