import { NextStepButton } from "../NextStepButton";
import { render } from "../../../../test-utils";

const goToNext = jest.fn();
jest.mock("@hashgraph/securitytoken-uicomponents/Indicators", () => ({
  ...jest.requireActual("@hashgraph/securitytoken-uicomponents/Indicators"),
  useStepContext: () => ({ goToNext }),
}));

describe(`${NextStepButton.name}`, () => {
  test("render correctly", () => {
    const component = render(<NextStepButton />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
