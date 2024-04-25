import { PreviousStepButton } from "../PreviousStepButton";
import { render } from "../../../../test-utils";

const goToPrevious = jest.fn();
jest.mock("@hashgraph/securitytoken-uicomponents/Indicators", () => ({
  ...jest.requireActual("@hashgraph/securitytoken-uicomponents/Indicators"),
  useStepContext: () => ({ goToPrevious }),
}));

describe(`${PreviousStepButton.name}`, () => {
  test("render correctly", () => {
    const component = render(<PreviousStepButton />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
