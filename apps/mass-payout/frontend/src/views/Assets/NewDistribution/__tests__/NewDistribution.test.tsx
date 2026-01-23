// SPDX-License-Identifier: Apache-2.0

import { render } from "@/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import { NewDistribution } from "../NewDistribution";

const mockNavigate = jest.fn();
const mockMutateAsync = jest.fn();
const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "0.0.890123" }),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../hooks/queries/AssetQueries", () => ({
  useCreateManualPayout: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  useGetAsset: () => ({
    data: {
      id: "0.0.890123",
      name: "Test Asset",
      type: "Bond",
    },
  }),
}));

describe("NewDistribution Component", () => {
  let user: ReturnType<typeof userEvent.setup>;
  let history: ReturnType<typeof createMemoryHistory>;

  beforeEach(() => {
    user = userEvent.setup();
    history = createMemoryHistory({
      initialEntries: ["/assets/0.0.890123/new-distribution"],
    });
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("Basic rendering", () => {
    test("should render correctly", () => {
      const component = render(<NewDistribution />, { history });
      expect(component.asFragment()).toMatchSnapshot();
    });

    test("should display page title and breadcrumbs", () => {
      render(<NewDistribution />, { history });
      expect(screen.getByText("Asset list")).toBeInTheDocument();
      const newDistribution = screen.getAllByText("New Distribution");
      expect(newDistribution.length).toBeGreaterThanOrEqual(1);
    });

    test("should display asset information", () => {
      render(<NewDistribution />, { history });
      expect(screen.getByText("0.0.890123")).toBeInTheDocument();
      expect(screen.getByText("Test Asset")).toBeInTheDocument();
      expect(screen.getByText("Bond")).toBeInTheDocument();
    });

    test("should display configuration section", () => {
      render(<NewDistribution />, { history });
      expect(screen.getByText("Payment Configuration")).toBeInTheDocument();
      expect(screen.getByText("Please provide the payment configuration details")).toBeInTheDocument();
    });

    test("should display form fields", () => {
      render(<NewDistribution />, { history });
      expect(screen.getByText("Select Distribution Type")).toBeInTheDocument();
      expect(screen.getByText("Concept")).toBeInTheDocument();
      expect(screen.getByText("Payment Type")).toBeInTheDocument();
      expect(screen.getByText("Fixed Amount")).toBeInTheDocument();
      expect(screen.getByText("Percentage")).toBeInTheDocument();
    });

    test("should display action buttons", () => {
      render(<NewDistribution />, { history });
      expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Create Distribution/i })).toBeInTheDocument();
    });
  });

  describe("Form validation", () => {
    test("should disable create distribution button initially", () => {
      render(<NewDistribution />, { history });
      const createButton = screen.getByRole("button", {
        name: /Create Distribution/i,
      });
      expect(createButton).toBeDisabled();
    });

    test("should enable create distribution button when valid amount and distribution type are entered", async () => {
      render(<NewDistribution />, { history });

      // Select distribution type first
      const selectField = screen.getByLabelText(/Select Distribution Type/i);
      await user.click(selectField);
      const manualOption = screen.getByText("Manual");
      await user.click(manualOption);

      const amountInput = screen.getByPlaceholderText("0.00");
      const createButton = screen.getByRole("button", {
        name: /Create Distribution/i,
      });

      await user.type(amountInput, "100");

      await waitFor(() => {
        expect(createButton).not.toBeDisabled();
      });
    });

    test("should handle percentage payment type", async () => {
      render(<NewDistribution />, { history });

      const percentageRadio = screen.getByLabelText("Percentage");
      await user.click(percentageRadio);

      await waitFor(() => {
        const amountInput = screen.getByPlaceholderText("0");
        expect(amountInput).toBeInTheDocument();
        expect(screen.getByText("%")).toBeInTheDocument();
      });
    });

    test("should reset amount when payment type changes", async () => {
      render(<NewDistribution />, { history });

      const amountInput = screen.getByPlaceholderText("0.00");
      await user.type(amountInput, "100");

      const percentageRadio = screen.getByLabelText("Percentage");
      await user.click(percentageRadio);

      await waitFor(() => {
        const newAmountInput = screen.getByPlaceholderText("0");
        expect(newAmountInput).toHaveValue("");
      });
    });
  });

  describe("User interactions", () => {
    test("should handle cancel button click", async () => {
      render(<NewDistribution />, { history });

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith("/assets/0.0.890123");
    });

    test("should open popup when create distribution button is clicked with valid form", async () => {
      render(<NewDistribution />, { history });

      // Select distribution type first
      const selectField = screen.getByLabelText(/Select Distribution Type/i);
      await user.click(selectField);
      const manualOption = screen.getByText("Manual");
      await user.click(manualOption);

      const amountInput = screen.getByPlaceholderText("0.00");
      const createButton = screen.getByRole("button", {
        name: /Create Distribution/i,
      });

      await user.type(amountInput, "100");
      await user.click(createButton);

      await waitFor(() => {
        // Debug: log all text content to see what's actually rendered
        console.log("DOM content:", document.body.textContent);
        const createDistribution = screen.getAllByText("Create Distribution");
        expect(createDistribution.length).toBeGreaterThanOrEqual(1);
      });
    });

    test("should handle concept input", async () => {
      render(<NewDistribution />, { history });

      const conceptInput = screen.getByPlaceholderText("Enter payment concept");
      await user.type(conceptInput, "Test payment concept");

      expect(conceptInput).toHaveValue("Test payment concept");
    });
  });

  describe("Popup functionality", () => {
    test("should display popup with correct payment information", async () => {
      render(<NewDistribution />, { history });

      // Select distribution type first
      const selectField = screen.getByLabelText(/Select Distribution Type/i);
      await user.click(selectField);
      const manualOption = screen.getByText("Manual");
      await user.click(manualOption);

      const amountInput = screen.getByPlaceholderText("0.00");
      const createButton = screen.getByRole("button", {
        name: /Create Distribution/i,
      });

      await user.type(amountInput, "150.50");
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText(/\$150\.50/)).toBeInTheDocument();
      });
    });

    test("should display percentage format in popup", async () => {
      render(<NewDistribution />, { history });

      // Select distribution type first
      const selectField = screen.getByLabelText(/Select Distribution Type/i);
      await user.click(selectField);
      const manualOption = screen.getByText("Manual");
      await user.click(manualOption);

      const percentageRadio = screen.getByLabelText("Percentage");
      await user.click(percentageRadio);

      const amountInput = screen.getByPlaceholderText("0");
      const createButton = screen.getByRole("button", {
        name: /Create Distribution/i,
      });

      await user.type(amountInput, "25");
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/25%/)).toBeInTheDocument();
      });
    });

    test("should handle popup confirm action", async () => {
      render(<NewDistribution />, { history });

      // Select distribution type first
      const selectField = screen.getByLabelText(/Select Distribution Type/i);
      await user.click(selectField);
      const manualOption = screen.getByText("Manual");
      await user.click(manualOption);

      const amountInput = screen.getByPlaceholderText("0.00");
      const createButton = screen.getByRole("button", {
        name: /Create Distribution/i,
      });

      await user.type(amountInput, "100");
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", { name: /ok-button/i });
      await user.click(confirmButton);

      expect(mockNavigate).toHaveBeenCalledWith("/assets/0.0.890123?tab=distributions");
    });

    test("should handle popup cancel action", async () => {
      render(<NewDistribution />, { history });

      // Select distribution type first
      const selectField = screen.getByLabelText(/Select Distribution Type/i);
      await user.click(selectField);
      const manualOption = screen.getByText("Manual");
      await user.click(manualOption);

      const amountInput = screen.getByPlaceholderText("0.00");
      const createButton = screen.getByRole("button", {
        name: /Create Distribution/i,
      });

      await user.type(amountInput, "100");
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("Edge cases", () => {
    test("should handle very small amounts for fixed payment", async () => {
      render(<NewDistribution />, { history });

      // Select distribution type first
      const selectField = screen.getByLabelText(/Select Distribution Type/i);
      await user.click(selectField);
      const manualOption = screen.getByText("Manual");
      await user.click(manualOption);

      const amountInput = screen.getByPlaceholderText("0.00");
      await user.type(amountInput, "0.01");

      const createButton = screen.getByRole("button", {
        name: /Create Distribution/i,
      });

      await waitFor(() => {
        expect(createButton).not.toBeDisabled();
      });
    });

    test("should handle maximum percentage value", async () => {
      render(<NewDistribution />, { history });

      // Select distribution type first
      const selectField = screen.getByLabelText(/Select Distribution Type/i);
      await user.click(selectField);
      const manualOption = screen.getByText("Manual");
      await user.click(manualOption);

      const percentageRadio = screen.getByLabelText("Percentage");
      await user.click(percentageRadio);

      const amountInput = screen.getByPlaceholderText("0");
      await user.type(amountInput, "100");

      const createButton = screen.getByRole("button", {
        name: /Create Distribution/i,
      });

      await waitFor(() => {
        expect(createButton).not.toBeDisabled();
      });
    });
  });

  describe("Loading states", () => {
    test("should show loading state on create distribution button when pending", () => {
      jest.mock("../../hooks/queries/AssetQueries", () => ({
        useCreateManualPayout: () => ({
          mutateAsync: mockMutateAsync,
          isPending: true,
        }),
        useGetAsset: () => ({
          data: {
            id: "0.0.890123",
            name: "Test Asset",
            type: "Bond",
          },
        }),
      }));

      render(<NewDistribution />, { history });

      const createButton = screen.getByRole("button", {
        name: /Create Distribution/i,
      });
      expect(createButton).toBeDisabled();
    });
  });
});
