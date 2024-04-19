import { PreviousStepButton } from "../PreviousStepButton";
import { render } from "../../../../test-utils";

const goToPrevious = jest.fn();
jest.mock("@iob/io-bricks-ui/Indicators", () => ({
  ...jest.requireActual("@iob/io-bricks-ui/Indicators"),
  useStepContext: () => ({ goToPrevious }),
}));

describe(`${PreviousStepButton.name}`, () => {
  test("render correctly", () => {
    const component = render(<PreviousStepButton />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
