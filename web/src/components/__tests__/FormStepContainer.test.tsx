import { FormStepContainer } from "../FormStepContainer";
import { render } from "../../test-utils";
import { Text } from "@hashgraph/securitytoken-uicomponents/Foundations";

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
