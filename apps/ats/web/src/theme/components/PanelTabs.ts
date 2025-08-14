import {
  panelTabsPartsList,
  PanelTabsThemeConfiguration,
} from '../../components/PanelTabs/PanelTabs';

export const ConfigPanelTabs: PanelTabsThemeConfiguration = {
  parts: panelTabsPartsList,
  baseStyle: {
    root: {
      position: 'relative',
    },
    tablist: {
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
      borderColor: 'neutral.500',
    },
    tab: {
      textStyle: 'BodyRegularMD',
      '--tabs-color': 'color-text-title',
      height: '56px',
      transition: 'all 0.2s',
      mb: '-1px',
      '&:hover:not([aria-selected=true])': {
        position: 'relative',
        bgColor: 'color-bg-sectionTab-hover',
        _before: {
          content: "''",
          position: 'absolute',
          left: '0',
          right: '0',
          bottom: '0',
          height: '1px',
          bg: 'color-border-solid',
        },
        _disabled: {
          color: 'color-text-disabled',
          bgColor: 'transparent',
          _before: {
            content: 'none',
          },
        },
      },
      _focus: {
        borderBottomRadius: '0px',
      },
      _selected: {
        color: 'primary.500',
        textStyle: 'BodySemiboldMD',
        borderBottomWidth: '4px',
        borderBottomColor: 'primary.500',
      },
      _disabled: {
        color: 'color-text-disabled',
        bgColor: 'transparent',
        _before: {
          content: 'none',
        },
      },
    },
    tabpanel: {
      p: 0,
      pt: 4,
    },
  },
  variants: {
    table: {
      tab: {
        borderBottom: '1px solid',
        height: '52px',
        borderBottomColor: 'color-border-solid',
        '&:hover:not([aria-selected=true])': {
          bgColor: 'color-bg-base-hover',
          _before: {
            height: 0,
          },
        },
        _selected: {
          borderBottom: '1px solid',
          color: 'color-text-table-tab-selected',
          borderColor: 'color-branded',
        },
        _disabled: {
          color: 'color-text-disabled',
          bgColor: 'color-bg-disabled',
          borderColor: 'color-border-disabled',
        },
      },
      tablist: {
        textStyle: 'BodyRegularSM',
        color: 'color-text-title',
        bgColor: 'color-bg-container-01',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
      },
    },
  },
  defaultProps: {
    variant: 'unstyled',
  },
};
