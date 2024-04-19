import { CancelButton } from "../CancelButton";
import { render } from "../../test-utils";

describe(`${CancelButton.name}`, () => {
  test("render correctly", () => {
    const component = render(<CancelButton />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
