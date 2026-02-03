// SPDX-License-Identifier: Apache-2.0

import { PreviousStepButton } from "../PreviousStepButton";
import { render } from "../../../../test-utils";

const goToPrevious = jest.fn();
jest.mock("io-bricks-ui", () => ({
  ...jest.requireActual("io-bricks-ui"),
  useStepContext: () => ({ goToPrevious }),
}));

describe(`${PreviousStepButton.name}`, () => {
  test("render correctly", () => {
    const component = render(<PreviousStepButton />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
