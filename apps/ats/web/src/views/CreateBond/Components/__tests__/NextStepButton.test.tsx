// SPDX-License-Identifier: Apache-2.0

import { NextStepButton } from "../NextStepButton";
import { render } from "../../../../test-utils";

const goToNext = jest.fn();
jest.mock("io-bricks-ui", () => ({
  ...jest.requireActual("io-bricks-ui"),
  useStepContext: () => ({ goToNext }),
}));

describe(`${NextStepButton.name}`, () => {
  test("render correctly", () => {
    const component = render(<NextStepButton />);

    expect(component.asFragment()).toMatchSnapshot();
  });
});
