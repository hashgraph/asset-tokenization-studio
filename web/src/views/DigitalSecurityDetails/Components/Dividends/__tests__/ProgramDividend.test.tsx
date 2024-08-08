import { ProgramDividend } from "../ProgramDividend";
import { render } from "../../../../../test-utils";

// TODO Improve tests when it is connected to SDK
describe(`${ProgramDividend.name}`, () => {
  test("should render correctly", () => {
    const component = render(<ProgramDividend />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
