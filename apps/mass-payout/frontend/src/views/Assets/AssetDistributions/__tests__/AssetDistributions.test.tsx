// SPDX-License-Identifier: Apache-2.0

import { render } from "@/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssetDistributions } from "../AssetDistributions";
import { useGetAssetDistributions } from "../../hooks/queries/AssetQueries";
import { useAssetDistributionsColumns } from "../../hooks/useAssetDistributionsColumns";
import { mockDistributions } from "@/test-utils/mocks";

// Mock the hooks
jest.mock("../../hooks/queries/AssetQueries");
jest.mock("../../hooks/useAssetDistributionsColumns");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ assetId: "test-asset-id" }),
  useNavigate: () => jest.fn(),
}));

const mockUseGetAssetDistributions = useGetAssetDistributions as jest.MockedFunction<typeof useGetAssetDistributions>;
const mockUseAssetDistributionsColumns = useAssetDistributionsColumns as jest.MockedFunction<
  typeof useAssetDistributionsColumns
>;

const mockDistributionsData = {
  content: [
    {
      ...mockDistributions[0],
      id: "dist-1",
      status: "Upcoming",
      concept: "Dividend Payment",
      type: "Manual",
      trigger: "Manual",
      configuratedAmount: "1000.00",
      nextExecutionTime: "2024-02-01T10:00:00Z",
    },
    {
      ...mockDistributions[1],
      id: "dist-2",
      status: "Ongoing",
      concept: "Interest Payment",
      type: "Corporate Action",
      trigger: "Automatic",
      configuratedAmount: "2000.00",
      distributedAmount: "1500.00",
      recipientHolders: 150,
      executionStartTime: "2024-01-15T09:00:00Z",
      executionEndTime: null,
      progress: 75,
    },
    {
      ...mockDistributions[2],
      id: "dist-3",
      status: "Completed",
      concept: "Final Payment",
      type: "Manual",
      trigger: "Manual",
      configuratedAmount: "5000.00",
      distributedAmount: "5000.00",
      recipientHolders: 200,
      executionStartTime: "2024-01-10T08:00:00Z",
      executionEndTime: "2024-01-10T12:00:00Z",
    },
  ],
  totalElements: 3,
  totalPages: 1,
  size: 10,
  number: 0,
};

const mockColumnsData = {
  upcoming: {
    columns: [
      { id: "distributionId", header: "Distribution ID", accessorKey: "id" },
      { id: "concept", header: "Concept", accessorKey: "concept" },
      { id: "status", header: "Status", accessorKey: "status" },
    ],
    modal: null,
  },
  ongoing: {
    columns: [
      { id: "distributionId", header: "Distribution ID", accessorKey: "id" },
      { id: "concept", header: "Concept", accessorKey: "concept" },
      { id: "progress", header: "Progress", accessorKey: "progress" },
      { id: "status", header: "Status", accessorKey: "status" },
    ],
    modal: null,
  },
  completed: {
    columns: [
      { id: "distributionId", header: "Distribution ID", accessorKey: "id" },
      { id: "concept", header: "Concept", accessorKey: "concept" },
      {
        id: "distributedAmount",
        header: "Distributed Amount",
        accessorKey: "distributedAmount",
      },
      { id: "status", header: "Status", accessorKey: "status" },
    ],
    modal: null,
  },
};

const defaultProps = {
  assetId: "test-asset-id",
  isPaused: false,
  onPauseUnpause: jest.fn(),
  onImportCorporateActions: jest.fn(),
  handleNewDistribution: jest.fn(),
  isImportingCorporateActions: false,
};

describe("AssetDistributions", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseGetAssetDistributions.mockReturnValue({
      data: mockDistributionsData,
      isLoading: false,
      error: null,
      isError: false,
    } as any);

    mockUseAssetDistributionsColumns.mockReturnValue(mockColumnsData as any);
  });

  describe("Basic rendering", () => {
    it("should render correctly", () => {
      const component = render(<AssetDistributions {...defaultProps} />);
      expect(component.asFragment()).toMatchSnapshot();
    });

    it("should render tabs for different distribution states", async () => {
      render(<AssetDistributions {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Upcoming")).toBeInTheDocument();
        expect(screen.getByText("Ongoing")).toBeInTheDocument();
        expect(screen.getByText("Completed")).toBeInTheDocument();
      });
    });
  });

  describe("Pause/Unpause functionality", () => {
    it("should show unpause button when asset is paused", async () => {
      render(<AssetDistributions {...defaultProps} isPaused={true} />);

      await waitFor(() => {
        expect(screen.getByText("Unpause Distributions")).toBeInTheDocument();
        expect(screen.queryByText("New Distribution")).not.toBeInTheDocument();
      });
    });

    it("should call onPauseUnpause when pause button is clicked", async () => {
      const user = userEvent.setup();
      render(<AssetDistributions {...defaultProps} />);

      const pauseButton = screen.getByText("Pause Distributions");
      await user.click(pauseButton);

      expect(defaultProps.onPauseUnpause).toHaveBeenCalledTimes(1);
    });

    it("should hide new distribution button when paused", async () => {
      render(<AssetDistributions {...defaultProps} isPaused={true} />);

      await waitFor(() => {
        expect(screen.queryByText("New Distribution")).not.toBeInTheDocument();
      });
    });
  });

  describe("Corporate Actions functionality", () => {
    it("should call onImportCorporateActions when switch is toggled", async () => {
      const user = userEvent.setup();
      render(<AssetDistributions {...defaultProps} />);

      const switchElement = screen.getByRole("checkbox");
      await user.click(switchElement);

      expect(defaultProps.onImportCorporateActions).toHaveBeenCalledTimes(1);
    });
  });

  describe("New Distribution functionality", () => {
    it("should call handleNewDistribution when new distribution button is clicked", async () => {
      const user = userEvent.setup();
      render(<AssetDistributions {...defaultProps} />);

      const newDistributionButton = screen.getByText("New Distribution");
      await user.click(newDistributionButton);

      expect(defaultProps.handleNewDistribution).toHaveBeenCalledTimes(1);
    });
  });
});
