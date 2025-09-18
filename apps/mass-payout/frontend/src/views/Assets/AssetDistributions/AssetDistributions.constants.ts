import { ProcessStatus } from '@/types/status';
import {
  DistributionFilterType,
  StatusFilterMap,
  AssetDistributionsFormValues,
  TabTitleMap,
} from './AssetDistributions.types';

export const statusMap = {
  COMPLETED: ProcessStatus.COMPLETED,
  FAILED: ProcessStatus.FAILED,
  IN_PROGRESS: ProcessStatus.IN_PROGRESS,
  SCHEDULED: ProcessStatus.SCHEDULED,
  CANCELLED: ProcessStatus.CANCELLED,
} as const;

export const DEFAULT_FORM_VALUES: AssetDistributionsFormValues = {
  search: '',
  distributionType: '',
};

export const DISTRIBUTION_FILTER_TYPES: DistributionFilterType[] = [
  'upcoming',
  'ongoing',
  'completed',
];

export const createStatusFilterMap = (): StatusFilterMap => ({
  upcoming: distribution => {
    const status =
      statusMap[distribution.status as keyof typeof statusMap] ||
      ProcessStatus.SCHEDULED;
    return status === ProcessStatus.SCHEDULED;
  },
  ongoing: distribution => {
    const status =
      statusMap[distribution.status as keyof typeof statusMap] ||
      ProcessStatus.SCHEDULED;
    return (
      status === ProcessStatus.IN_PROGRESS || status === ProcessStatus.FAILED
    );
  },
  completed: distribution => {
    const status =
      statusMap[distribution.status as keyof typeof statusMap] ||
      ProcessStatus.SCHEDULED;
    return (
      status === ProcessStatus.COMPLETED || status === ProcessStatus.CANCELLED
    );
  },
});

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 1000,
} as const;

export const DISTRIBUTION_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'IMMEDIATE', label: 'Manual' },
  { value: 'ONE_OFF', label: 'Scheduled' },
  { value: 'RECURRING', label: 'Recurring' },
  { value: 'AUTOMATED', label: 'Automated' },
  { value: 'CORPORATE_ACTION', label: 'Corporate Action' },
] as const;

//TODO: AÑADIR KEYS
export const TAB_TITLE_MAP: TabTitleMap = {
  upcoming: 'Upcoming Distributions',
  ongoing: 'Ongoing Distributions',
  completed: 'Completed Distributions',
};

export const getTabTitle = (filterType: DistributionFilterType): string => {
  return TAB_TITLE_MAP[filterType] || 'Distributions';
};
