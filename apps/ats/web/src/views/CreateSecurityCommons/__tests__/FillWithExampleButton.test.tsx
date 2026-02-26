// SPDX-License-Identifier: Apache-2.0

import { render } from "../../../test-utils";
import { useForm, FormProvider } from "react-hook-form";
import { FillWithExampleButton } from "../FillWithExampleButton";
import userEvent from "@testing-library/user-event";

const TestForm = () => {
  const methods = useForm<{ name: string }>({
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const getMockData = () => ({
    name: "Demo Name",
  });

  return (
    <FormProvider {...methods}>
      <form>
        <input aria-label="Name" {...methods.register("name", { required: true })} />
        <FillWithExampleButton getMockData={getMockData} translationKey="createBond.fillWithExample" />
      </form>
    </FormProvider>
  );
};

describe(`${FillWithExampleButton.name}`, () => {
  const factoryComponent = () => render(<TestForm />);

  test("should render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should fill form with example data and trigger validation", async () => {
    const component = factoryComponent();

    expect(component.getByLabelText("Name")).toHaveValue("");

    await userEvent.click(component.getByText("Fill with example data"));

    expect(component.getByLabelText("Name")).toHaveValue("Demo Name");
  });
});
