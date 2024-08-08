import { PreviousStepButton } from "../PreviousStepButton";
import { render } from "../../../../test-utils";

const goToPrevious = jest.fn();
jest.mock("@hashgraph/asset-tokenization-uicomponents/Indicators", () => ({
  ...jest.requireActual(
    "@hashgraph/asset-tokenization-uicomponents/Indicators",
  ),
  useStepContext: () => ({ goToPrevious }),
}));

describe(`${PreviousStepButton.name}`, () => {
  test("render correctly", () => {
    const component = render(<PreviousStepButton />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
