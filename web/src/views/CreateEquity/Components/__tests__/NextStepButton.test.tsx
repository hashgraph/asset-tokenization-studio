import { NextStepButton } from "../NextStepButton";
import { render } from "../../../../test-utils";

const goToNext = jest.fn();
jest.mock("@iob/io-bricks-ui/Indicators", () => ({
  ...jest.requireActual("@iob/io-bricks-ui/Indicators"),
  useStepContext: () => ({ goToNext }),
}));

describe(`${NextStepButton.name}`, () => {
  test("render correctly", () => {
    const component = render(<NextStepButton />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
