// SPDX-License-Identifier: Apache-2.0

import { screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { WizardConfiguration } from "../components/WizardConfiguration";
import { render } from "@/test-utils";

// Mock the step components that use useFormContext
jest.mock("../components/StepAssetDetails", () => ({
  StepAssetDetails: ({ goToNext }: { goToNext: () => void }) => (
    <div data-testid="step-asset-details">
      <button onClick={goToNext}>Next</button>
    </div>
  ),
}));

jest.mock("../components/StepReview", () => ({
  StepReview: () => <div data-testid="step-review">Review Step</div>,
}));

interface ImportAssetFormValues {
  assetId: string;
  assetName: string;
  assetSymbol: string;
  assetType: string;
}

const TestWrapper = () => {
  const form = useForm<ImportAssetFormValues>({
    defaultValues: {
      assetId: "",
      assetName: "",
      assetSymbol: "",
      assetType: "",
    },
  });

  const mockSteps = {
    activeStep: 0,
    setActiveStep: jest.fn(),
    activeStepPercent: 0,
    isActiveStep: jest.fn(),
    isCompleteStep: jest.fn(),
    isIncompleteStep: jest.fn(),
    getStatus: jest.fn(),
    goToNext: jest.fn(),
    goToPrevious: jest.fn(),
  };

  return <WizardConfiguration form={form} steps={mockSteps} />;
};

describe("WizardConfiguration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    test("should render correctly", () => {
      const component = render(<TestWrapper />);
      expect(component.asFragment()).toMatchSnapshot();
    });
    test("should render the wizard container with correct styling", () => {
      render(<TestWrapper />);

      const container = document.querySelector(".css-16hl5oj");
      expect(container).toBeInTheDocument();
    });

    test("should render wizard with correct steps", () => {
      render(<TestWrapper />);

      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(screen.getByText("Review")).toBeInTheDocument();

      const stepper = document.querySelector(".chakra-stepper");
      expect(stepper).toBeInTheDocument();
    });

    test("should render StepAssetDetails component in first step", () => {
      render(<TestWrapper />);

      expect(screen.getByTestId("step-asset-details")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
    });
  });

  describe("Step Configuration", () => {
    test("should configure wizard with exactly two steps", () => {
      render(<TestWrapper />);

      const steps = document.querySelectorAll(".chakra-step");
      expect(steps).toHaveLength(2);
    });

    test("should have correct step order", () => {
      render(<TestWrapper />);

      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(screen.getByText("Review")).toBeInTheDocument();

      const stepTitles = document.querySelectorAll(".chakra-step__title");
      expect(stepTitles[0]).toHaveTextContent("Details");
      expect(stepTitles[1]).toHaveTextContent("Review");
    });
  });
});
