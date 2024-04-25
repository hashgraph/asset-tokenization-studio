var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { ClipboardButtonTheme } from "./Components/ClipboardButton";
import { colors } from "./colors";
import { ConfigAddAreaButton } from "./Components/Forms/AddAreaButton";
import { ConfigAlert } from "./Components/Alert";
import { ConfigAvatar } from "./Components/Avatar";
import { ConfigBarChart } from "./Components/Charts/BarChart";
import { ConfigBreadcrumb } from "./Components/Breadcrumb";
import { ConfigButton } from "./Components/Button";
import { ConfigCalendar } from "./Components/Calendar";
import { ConfigCheckbox } from "./Components/Forms/Checkbox";
import { ConfigCircularSlider } from "./Components/CircularSlider";
import { ConfigDropdown } from "./Components/Dropdown";
import { ConfigFormError } from "./Components/Forms/FormError";
import { ConfigFormLabel } from "./Components/Forms/FormLabel";
import { ConfigHeader } from "./Components/Header";
import { ConfigIconButton } from "./Components/IconButton";
import { ConfigInput } from "./Components/Forms/Input";
import { ConfigLineChart } from "./Components/Charts/LineChart";
import { ConfigLogo } from "./Components/Logo";
import { ConfigPageTitle } from "./Components/PageTitle";
import { ConfigPasswordController } from "./Components/Forms/PasswordController";
import { ConfigPhosphorIcon } from "./Components/PhosphorIcon";
import { ConfigPopUp } from "./Components/PopUp";
import { ConfigProgress } from "./Components/Progress";
import { ConfigRadio } from "./Components/Forms/Radio";
import { ConfigSidebar } from "./Components/Sidebar/Sidebar";
import { ConfigSidebarDropdown } from "./Components/Sidebar/SidebarDropdown";
import { ConfigSidebarItem } from "./Components/Sidebar/SidebarItem";
import { ConfigSlider } from "./Components/Forms/Slider";
import { ConfigSpinner } from "./Components/Spinner";
import { ConfigStepper } from "./Components/Stepper";
import { ConfigTable } from "./Components/Table";
import { ConfigTabs } from "./Components/Tabs";
import { ConfigTag } from "./Components/Tag";
import { ConfigTextarea } from "./Components/Forms/Textarea";
import { ConfigToggle } from "./Components/Forms/Toggle";
import { ConfigTooltip } from "./Components/Tooltip";
import { DefinitionListThemeConfig } from "./Components/DefinitionList";
import { fonts, fontSizes, fontWeights } from "./fonts";
import { icons } from "./icons";
import { spacing } from "./spacing";
import { textStyles } from "./textStyles";
import { ConfigInfoDivider } from "./Components/InfoDivider";
import { ConfigDetailReview } from "./Components/DetailReview";
import { ConfigCardButton } from "./Components/CardButton";
import { ConfigLink } from "./Components/Link";
import { ConfigFileInput } from "./Components/Forms/FileInput";
import { ConfigFileCard } from "./Components/FileCard";
import { ConfigPanelTitle } from "./Components/PanelTitle";
export var BasePlatformTheme = __assign(__assign({ config: {
        initialColorMode: "light"
    }, colors: colors, components: {
        AddAreaButton: ConfigAddAreaButton,
        Alert: ConfigAlert,
        Avatar: ConfigAvatar,
        BarChart: ConfigBarChart,
        Breadcrumb: ConfigBreadcrumb,
        Button: ConfigButton,
        CardButton: ConfigCardButton,
        Calendar: ConfigCalendar,
        Checkbox: ConfigCheckbox,
        CircularSlider: ConfigCircularSlider,
        ClipboardButton: ClipboardButtonTheme,
        DefinitionList: DefinitionListThemeConfig,
        Dropdown: ConfigDropdown,
        FormError: ConfigFormError,
        FormLabel: ConfigFormLabel,
        Header: ConfigHeader,
        FileInput: ConfigFileInput,
        FileCard: ConfigFileCard,
        IconButton: ConfigIconButton,
        Input: ConfigInput,
        LineChart: ConfigLineChart,
        Link: ConfigLink,
        Logo: ConfigLogo,
        PageTitle: ConfigPageTitle,
        PasswordController: ConfigPasswordController,
        PhosphorIcon: ConfigPhosphorIcon,
        PopUp: ConfigPopUp,
        Progress: ConfigProgress,
        Radio: ConfigRadio,
        Sidebar: ConfigSidebar,
        SidebarDropdown: ConfigSidebarDropdown,
        SidebarItem: ConfigSidebarItem,
        Slider: ConfigSlider,
        Spinner: ConfigSpinner,
        Stepper: ConfigStepper,
        Switch: ConfigToggle,
        Table: ConfigTable,
        Tabs: ConfigTabs,
        Tag: ConfigTag,
        Textarea: ConfigTextarea,
        Tooltip: ConfigTooltip,
        InfoDivider: ConfigInfoDivider,
        DetailReview: ConfigDetailReview,
        PanelTitle: ConfigPanelTitle
    }, layout: {}, icons: icons }, spacing), { fonts: fonts, fontSizes: fontSizes, fontWeights: fontWeights, lineHeights: fontSizes, textStyles: textStyles, layerStyles: {}, radii: { simple: "4px" }, shadows: {
        outline: "0 0 0 3px var(--chakra-colors-primary-100)"
    }, styles: {
        global: {
            "*": {
                fontFamily: "regular",
                fontWeight: "normal"
            }
        }
    }, semanticTokens: {
        fonts: {
            light: "inter",
            regular: "inter",
            medium: "inter",
            semiBold: "inter",
            bold: "inter"
        },
        colors: {
            alternativesA: "alternativesA.500",
            alternativesB: "alternativesB.500",
            alternativesC: "alternativesC.500",
            alternativesD: "alternativesD.500",
            error: "error.500",
            info: "info.500",
            neutral: "white",
            primary: "primary.500",
            secondary: "secondary.500",
            success: "success.500",
            tertiary: "tertiary.500",
            warning: "warning.500"
        }
    } });
export default BasePlatformTheme;
