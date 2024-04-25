# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v2.7.2] - 24-01-2024

### Changed

- Fixed `InputNumberController` to be able to reset the field (from subversion `v2.4.3`)

## [v2.7.1] - 11-01-2024

### Changed

- `DefinitionList` title receives correctly title styles. [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/244)
- Removed `DefinitionList` 480px max width. [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/244)

## [v2.7.0] - 23-11-2023

### Changed

- Changed base font to `Inter` instead of `Mulish` [MR] (https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/243)
- Removed table footer when no records found.[MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/242)

## [v2.6.0] - 13-11-2023

## Added

- Added focus border color in `Dropdown` , `Tab`, `Tag`, `Breadcrumbs` and `Sidebar` components.[MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/212)

### Changed

- Changed `gray` color name to `neutral`.[MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/212)

## [v2.5.0] - 06-11-2023

### Changed

- Changed `Calendar` to separate months and years in two different dropdowns. [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/241)

## [v2.4.3] - 24-01-2024

### Changed

- Fixed `InputNumberController` to be able to reset the field

## [v2.4.2] - 24-10-2023

## Added

- Export `SeachInputController` [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/240)

## [v2.4.1] - 10-10-2023

### Changed

- Changed `label` property of `Input` component to accept `string` and `React.Element`. [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/232)

### Added

- Added new optional prop `subLabel` to `Input` component. [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/232)
- Added `customTitle` prop to `AccordionItem` to render a full customized title in `AccordionItem` [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/239)

**Whatever change that you are adding, you should describe it under this line without removing it. Do NOT generate a new version**

## [v2.4.0] - 28-09-2023

### Changed

- Changed `onChangeDefault` in `InputNumberController` to convert a empty string when is undefined. [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/237)

## Added

- Make fonts customizable in theme by `sematicTokens`[MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/236)

## [v2.3.2] - 21-09-2023

### Changed

- Input `bottomDescription` prop validation to hidden unncesary p tag
- Changed `defaultValue` prop of `InputNumberController` to accept number 0 as a default value.
- `Td` component is not focusable by default. [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/235)

### Added

- Added `size` prop to `PopUp` stories and component

## [v2.3.1] - 12-09-2023

### Changed

- Changed `PanelTitle` component baseStyle. [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/231)

## [v2.3.0] - 07-09-2023

### Added

- Added new optional props `topDescription` and `bottomDescription` to `Input` component. [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/230)
- Added new component `PanelTitle`. [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/230)

### Changed

- Prop `title` in component `DefinitionList` is now optional. [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/230)
- Fixed `isDisabled` prop in `Link` component. Now onClick is not triggered if this prop is true [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/227)

## [v2.2.4] - 04-09-2023

### Changed

- Fixed `useToast` `show` to be able to set custom duration [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/229)

## [v2.2.3] - 24-08-2023

### Changed

- Fixed `ToggleController` & `TextareaController` set default values [MR](https://gitlab.com/iobuilders/projects/eng/platform-ui-shared/io-bricks-ui/-/merge_requests/226)

## [v2.2.2] - 02-08-2023

### Changed

- Rename `RowExpandedContent` prop to `rowExpandedContent` prop in `Table`component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/223)
- Fix `ExpandableRow styles` in `Table`component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/223)
- Modified `TagThemeConfiguration`, `PhosphorIconThemeConfiguration`, `LogoThemeConfiguration` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/224)

## [v2.2.1] - 28-07-2023

### Added

- Added `LinkThemeConfiguration` type [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/222)

### Changed

- Modified `ButtonThemeConfiguration` & `IconButtonThemeConfiguration` type [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/222)

## [v2.2.0] - 27-07-2023

### Added

- Added `allowMultiExpand` prop in `Table` component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/217)
- Added `RowExpandedContent` prop in `Table` component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/217)
- Added `enableExpanding` prop in `Table` component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/217)
- Added spread of props in `TableTitle` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/216)

### Changed

- Fix `SortingIcon` color in `Table` theme. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/217)
- Updated Interaction `index` with `HoverableContent` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/216)
- Replaced the imports of all modules from the `date-fns` library with the imports of only the necessary modules [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/215)
- Removed default `errorMessage` and `label` props. Allows to receive a children. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/219)
- `CalendarPanel` changed to be rendered lazily [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/220)
- Removed unnecesary `<p>` in `Step` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/221)
- Changed some styling to match figma in `Step` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/221)

## [v2.1.2] - 13-07-2023

- Fixed bug on `emptyComponent` prop of table. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/214)

## [v2.1.1] - 12-07-2023

- Added `emptyComponent`prop in `Table`component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/213)

## [v2.1.0] - 10-07-2023

### Added

- Added `noOfLines` prop in `Table` cell. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/211)
- Added `isLoading` prop in `InfoDivider` component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/208)
- Added `isLoading` prop in `CircularSlider` component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/205)
- Added `isLoading` prop in `BarChart` component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/203)
- Added `isLoading` prop in `FileCard` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/202)
- Added `isLoading` prop in `Table` component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/201)
- Added `isLoading` prop in `Avatar` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/199)
- Added `isLoading` prop in `Tag` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/198)
- Added `isLoading` prop in `Breadcrumb` item component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/197)
- Added `isLoading` prop in `DetailReview` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/196)
- Added `isLoading` prop in `PageTitle` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/195)
- Added `isLoading` prop in `DefinitionList` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/194)
- Added `HoverableContent` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/193)
- Added `SearchInputController` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/192)
- Added `ConfirmationPopUp` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/210)

### Changed

- Remove default `padding` in `Tabs` tabpanel [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/209)
- Fixed `onInitFocus` in `PopUp` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/208)
- Fixed focus style in `Button` and `IconButton` components [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/204)
- Fixed style in `Stepper` component without decription [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/191)

## [v2.0.0] - 03-07-2023

### Changed

- `react-icons` library has been removed [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/188)
- `CloseButton` uses `IconButton` instead of `CharkraIconButton`. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/187)
- Fixed style in `Alert` component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/187)
- Reorganized components for improved structure and consistency [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/186)
  - Added `Foundations` group with the following components: `Colors`, `Heading`, `Icon`, `Icons`, `MarkdownText`, `PhosphorIcon`, `Text` and `Typhography`.
  - Added `Basic` group with the following components: `Avatar` and `Logo`.
  - Added `Interaction` group with the following components: `Button`, `CardButton`, `ClipboardButton`, `CloseButton`, `IconButton` and `Link`.
  - Added `Forms` group with the following components: `AddArea`, `CalendarInput`, `Checkbox`, `FileInput`, `Input`, `Radio`, `RadioGroup`, `Select`, `Slider`, `Textarea` and `Toggle`.
    - Added `Controllers` group with the following components: `CalendarInputController`, `CheckboxController`, `CheckboxGroupController`, `FieldController`, `FileInputController`, `InputController`, `InputNumberController`, `PasswordController`, `RadioGroupController`, `SelectController`, `TextareaController` and `ToggleController`.
  - Added `Charts` group with the following components: `BarChart`, `CircularSlider` and `LineChart`
  - Added `Data display` group with the following components: `Accordion`, `Calendar`, `DefinitionList`, `DetailReview`, `Dropdown`, `FileCard`, `InfoDivider`, `Table`, `Tabs`, and `Tag`.
  - Added `Indicators` group with the following components: `Progress`, `Spinner`, `Stepper` and `Wizard`.
  - Added `Navigation` group with the following components: `Breadcrumb`, `Header`, `PageTitle` and `Sidebar`.
  - Added `Overlay` group with the following components: `Alert`, `Popup`, `Toast` and `Tooltip`.
- Changed `TagIob` to `Tag` in theme config.
- `textStyle` format has been changed with the following: `{type}{variant}{size}` (e.g.: `ElementsBoldSM`)
- Fixed long text display issue in the title and description of the `Stepper` component.
- `ClipboardIconButton` has been renamed to `ClipboardButton`.
- `partsListByTheme` constants have been changed to `{name}PartsList`.
- `variant` prop has been added in `Wizard` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/183)

## [v1.5.0] - 13-06-2023

### Changed

- `isClearable` and `onClear` props has been added in `Input` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/163)
- `minValue` and `maxValue` props has been added in `InputNumberController` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/161)
- `PhosphorIcon` library has been updated to `v.2.0.9` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/160)
- Added ellipsis in `Input` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/159)
- `DefinitionListItem` accepts components in `description` & `valueToCopy` prop. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/164)
- `DefinitionListItem` `itemTitle` has been changed to `title`. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/164)
- `Link` accepts now `children` instead of `label` prop [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/165)

## [v1.4.0] - 09-06-2023

### Added

- Added `Table` v1, `MultiTextCell`, `TableTitle` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/155)
- `FileInputController`, `FileInput` and `FileCard` has been added [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/151)[MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/153)

## [v1.3.4] - 08-06-2023

- Fixed bug in the `Calendar` component that disabled Saturdays [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/156)

## [v1.3.3] - 07-06-2023

### Added

- Added `isLoading` and `loadingIndicator` props in `Select` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/152)

- Added `disabledWeekends` , `disabledWeekdays` and `disabledDates` props in `Calendar` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/154)
- Added `format` prop in `CalendarInput` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/154)
- Fixed bug in the `Calendar` component that disabled Saturdays [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/156)

## [v1.3.2] - 05-06-2023

### Changed

- Fix `AddAreaButton` styles [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/171)
- Changed the `Alert Component` icon to use the `Spinner` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/150)

## [v1.3.1] - 05-06-2023

- Fixed toast bugs, Updated the loading icon of the `Alert component`, Increased the default duration of the loading status, Updated the `ToastConfigurator component` to not force component to be passed through props, updated the `useToast` hook so that it can get the `defaultProps` from the `ToastConfigurator` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/148)

## [v1.3.0] - 05-06-2023

This version matches part of the [v1.4.0 from design](https://iobuilders.atlassian.net/wiki/spaces/UD/pages/2730328119/ioBricks+Versions#V1.4.0---26%2F05%2F2023)

### Changed

- Added default left icon in `CalendarInputField` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/145)

- Space `14` has been changed from '4rem' to '3.5rem' [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/147)

### Added

- `Link` has been added [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/146)
- `CardButton` has been added [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/144)
- `AddAreaButton` has been added [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/43)

## [v1.2.2] - 01-06-2023

### Added

- `SelectController` can select values that are not just primitives [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/144)

## [v1.2.1] - 01-06-2023

### Changed

- Fixed `SelectController` couldn't be resetted [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/142)
- Fixed `Calendar` component issues [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/141)
- Fixed padding horizontal in `Popup` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/141)
- Fixed default size to `xxs` and added the ability to change it in the `ClipboardIconButton` component [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/141)

## [v1.2.0] - 30-05-2023

### Added

- `InfoDivider` has been added [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/137)
- `DetailReview` has been added [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/137)

### Changed

- Modified `CheckboxGroupController` to be wrapped by a flex container [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/137)

## [v1.1.2] - 29-05-2023

### Changed

- `Wizard` uses memo to handle the `currentStep` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/140)

### Added

- `CheckboxGroupController` has been added [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/139)
- `CalendarInputController` shows `isRequired` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/140)
- `Select` added missing `value` prop [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/140)
- `useSteps` now supports all props from chakra ui hook [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/140)

## [v1.1.1] - 24-05-2023

### Changed

- `Step` type has been modified to omit content prop. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/138)
- `Wizard` wraps steps now in `StepContextProvider` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/138)
- Exported `useSteps` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/138)
- Modified `Wizard` props to add Context related values. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/138)

### Added

- `StepContextProvider` & `useStepContext` have been added. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/138)

## [v1.1.0] - 23-05-2023

This version matches `iobricks design version` [1.3.1](https://iobuilders.atlassian.net/wiki/spaces/UD/pages/2730328119/ioBricks+Versions#V1.3.1---12%2F05%2F2023)

### Changed

- Modified `Alert` styles to match figma design and toast default duration to last 8 seconds to close.[MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/132)
- Updated `Toast` to close by default. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/134)

### Added

- `Stepper` & `wizard` have been aded. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/125)
- `ClipboardIconButton` and `DefinitionList` have been aded. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/127)
- `Tab` has been aded. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/131)

- `Stepper & wizard component` have been aded. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/125)

## [v1.0.1] - 08-05-2023

- Added `RadioGroup` ref
- Improved `PhosphorIcon` PhosphorIconThemeConfiguration

## [v1.0.0] - 08-05-2023

This version matches iobricks design version [1.1.1](https://iobuilders.atlassian.net/wiki/spaces/UD/pages/2730328119/ioBricks+Versions#V1.1.1---14%2F04%2F2023)

### Modified

- Refactorized `Input`. Label is now before the input element. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/90)
- Modified `Input` styles to match figma design. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/90)
- Modified `Textarea` styles to match figma design. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/90)
- Modified `Radio` styles to match figma design. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/97)
- Modified `Checkbox` styles to match figma design. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/97)
- Modified `Toggle` styles to match figma design. (previously was `Switch` component) [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/97)
- Renamed `Switch` to `Toggle` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/97)
- Modified `Avatar` styles to match figma design. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/100)
- Modified `Select` styles to match figma design using `Input` & `Dropdown` styles. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/108)
- Modified `Tag` styles to match figma design [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/104)
- Modified `Alert` styles to match figma design. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/107)
- Modified `Toast` hook and utilities to improve the component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/107)

- Refactorized `Input`. Label is now before the input element. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/90)
- Modified `Input` styles to match figma design. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/90)
- Modified `Textarea` styles to match figma design. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/90)
- Modified `Radio` styles to match figma design. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/97)
- Modified `Checkbox` styles to match figma design. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/97)
- Modified `Toggle` styles to match figma design. (previously was `Switch` component) [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/97)
- Renamed `Switch` to `Toggle` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/97)
- Modified `Avatar` styles to match figma design. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/100)
- Modified `Select` styles to match figma design using `Input` & `Dropdown` styles. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/108)
- Modified `Tag` styles to match figma design [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/104)
- Modified `Button and IconButton` styles to match figma design [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/129)

### Added

- Added `Breadcrumb` component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/114)
- Added `Mulish` fonts. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/88)
- Added text styles, font sizes, line heights, spaces. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/88)
- Added `Icon` styles for sizes. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/88)
- Added a static class to be able to call the `toast` actions from anywhere in the app without the need for a react component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/87)
- Fixed how white color is displayed in storybook
- Fixed the bug to close toast. A static class has been included to be able to call the toast actions from anywhere in the app without the need for a react component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/87)
- Added the colors of the design system. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/89)
- Added the buttons of the design system. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/81)
- Fixed the bug to close toast.[MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/87)
- Added `<T>` generic in useToast, added the functionality to display the component configured with the useToast hook and the statis class ToastUtilities. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/95)
- `Input` now supports `isSuccess` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/90)
- Added `InputButtonIcon` & `InputIcon` which should be used to add a right element to the input. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/90)
- Added a `defaultSize` to inputs. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/90)
- Added `TextareaController` component. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/90)
- `Textarea` now supports `isSuccess`, `label`, `maxLength`. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/90)
- `ToggleController` has been added [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/97)
- `Sidebar` organism has been added. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/99)
- `SidebarItem`, `SidebarItemWithDropdown` & `SidebarDropdownItem` have been added. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/99)
- `Header` organism & `Logo` have been added. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/100)
- `Dropdown` organism has been added. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/108)
- `Select` now uses `defaultSize` of inputs. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/108)
- Added `Spinner`. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/108)
- Added loading state to `Button`. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/108)
- Added hasArrow in true per default.[MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/103)
- Added Docs in `tooltip` stories.[MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/103)
- Set to dark props default in `tooltip`.[MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/103)
- `PageTitle` organism have been added.[MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/105)
- `InputNumberController` has been added. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/109)
- `Calendar Header` has been aded. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/115)
- `Calendar component` has been aded. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/116)
- `PopUp component` has been aded. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/120)

### Removed

- `Select` theme configuration has been removed.

# old (remove in the future)

## [v1.5.1] - 15-02-2023

- Added `id` & `name` to `SelectController` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/86)
- Added mock for `react-select` to not use custom components in tests. [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/86)

## [v1.5.0] - 31-01-2023

### Changed

- `CircularSlider` changes his style props, their parts change from `[label, container]` to `[label, track]` following `ChakraProgressAnatomy`. Now accepts ReactElement as label (string | React.ReactElement) [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/85)

## [v1.4.0] - 27-01-2023

- `Avatar` now supports prop `variant` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/84)

## [v1.3.1] - 24-01-2023

### Changed

- `SelectOption` now supports type generic [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/83)

## [v1.3.0] - 23-01-2023

### Added

- Support for `isRequired` in `SelectController` & `InputController` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/82)

## [v1.2.0] - 20-01-2023

### Added

- New prop `setsFullOption` in `SelectController` to set full option in the form [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/81)
- `Select` now supports a `label` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/81)

## [v1.1.0] - 19-01-2023

### Changed

- Fixed `InputController` showing value even if it was empty [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/80)

### Added

- `SelectController` now supports typed control [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/80)
- `SelectController` now supports `onChange` function [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/80)
- Exporting `CheckboxController` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/80)
- Exporting `useToast` as const [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/80)

## [v1.0.1] - 18-01-2023

- Fixed custom icon of `Checkbox` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/79)

## [v1.0.0] - 16-01-2023

- Released `v1.0.0` [MR](https://gitlab.com/iobuilders/io-bricks-ui/-/merge_requests/78)
