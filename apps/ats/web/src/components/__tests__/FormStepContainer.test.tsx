// SPDX-License-Identifier: Apache-2.0

import { FormStepContainer } from "../FormStepContainer";
import { render } from "../../test-utils";
import { Text } from "io-bricks-ui";

describe(`${FormStepContainer.name}`, () => {
  test("should render correctly", () => {
    const component = render(
      <FormStepContainer>
        <Text>TESTING</Text>
      </FormStepContainer>,
    );

    expect(component.asFragment()).toMatchSnapshot();
  });
});
