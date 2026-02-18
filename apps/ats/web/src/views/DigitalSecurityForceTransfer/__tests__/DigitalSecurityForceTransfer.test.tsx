// SPDX-License-Identifier: Apache-2.0

import { DigitalSecurityForceTransfer } from "../DigitalSecurityForceTransfer";
import { render } from "../../../test-utils";

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useParams: () => ({ id: "0.0.123456" }),
}));

describe(`${DigitalSecurityForceTransfer.name}`, () => {
  const factoryComponent = () => {
    return render(<DigitalSecurityForceTransfer />);
  };

  test("render correctly", () => {
    const component = factoryComponent();

    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should show Goback button", () => {
    const component = factoryComponent();

    const breadcrumbs = component.getByTestId("go-back-button");
    expect(breadcrumbs).toBeInTheDocument();
  });

  test("should show breadcrumbs", () => {
    const component = factoryComponent();

    const breadcrumbs = component.getByTestId("breadcrumb-desktop");
    expect(breadcrumbs).toBeInTheDocument();
  });

  test("should form be rendered properly", () => {
    const component = factoryComponent();

    const form = component.getByTestId("force-transfer-form");
    expect(form).toBeInTheDocument();
  });
});
