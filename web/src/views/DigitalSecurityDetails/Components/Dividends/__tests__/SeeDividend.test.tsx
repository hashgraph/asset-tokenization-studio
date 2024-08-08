import { SeeDividend } from "../SeeDividend";
import { render } from "../../../../../test-utils";

// TODO Improve tests when it is connected to SDK
describe(`${SeeDividend.name}`, () => {
  test("should render correctly", () => {
    const component = render(<SeeDividend />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
