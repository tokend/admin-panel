# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Please check our [developers guide](https://gitlab.com/tokend/developers-guide)
for further information about branching and tagging conventions.

## [Unreleased]
#### Fixed
- Fixed operation empty and loading list displaying of a user

#### Added
- "Invest" fee type

#### Changed
- Now using ErrorHandler instead of `error.showMessage()`,
  `$store.dispatch('SET_ERROR')`, `console.error`
- Replaced `ErrorHandler.process` by `ErrorHandler.processWithoutFeedback`
  in components' created hook

## [1.5.0] - 2019-04-19
### "Under the hood" changes
#### Changed
- Now using @tokend/js-sdk@1.5.0
- Make unchangeable adminId input field

## [1.5.0-rc.3] - 2019-04-19
### "Under the hood" changes
#### Changed
- Now using @tokend/js-sdk@1.5.0-rc.1

## [1.5.0-rc.2] - 2019-04-19
#### Removed
- Opera from noscript

## [1.5.0-rc.1] - 2019-04-17
#### Added
- User blocking functionality
- Displaying of avatar image on user's KYC details page

#### Changed
- Now blocking the account using change role request created by admin
- Menu reorganization:
  - Added new "Offline operations" menu item that contains pre-issuance,
    change asset issuer and pre-issuance requests pages
  - Merged "System assets" and "Assets" (formerly "Tokens") pages into "Assets"
  - Renamed "System assets" -> "Master assets"

#### Fixed
- Displaying user role & state on user details page

### "Under the hood" changes
#### Added
- Change role request record
- Outlined button class

#### Changed
- Extracted reset account actions to a separate component
- Now passing latest approved request ID in creator details
  while resetting or blocking the account

#### Removed
- Unused styles on user details page

## [1.5.0-rc.0] - 2019-04-16
#### Added
- "Request type" select field on assets requests page
- Missing "Loading" and "No data" state handlers and "More" buttons to all lists
- Validation of account field when setting limits for specific account
- Validation of max amount on issuance form

#### Changed
- Now handling value absenting in `DetailsReader`
- Reverted issuance history list (now the oldest ones on top)
- Renamed "Fund(s)" to "Sale(s)" and "Token(s)" to "Asset(s)"

#### Fixed
- Fixed filtering of sales by owner
- Fixed "You" label position in admin list
- Fixed dropdown of user account widget when you hover button below. Now the
  dropdown stays above the hovered button
- Hide invalid fields’ error box-shadow in Firefox

### "Under the hood" changes
#### Changed
- Now using @tokend/js-sdk@1.4.4
- Now getting asset requests from API v3
- Now getting operation history from API v3

#### Fixed
- Fixed getting of private document URL in `DocLinkGetter` component

#### Removed
- Removed thresholds code leftovers
- Removed signing rules page

## [1.4.0] - 2019-04-05

## [1.4.0-rc.1] - 2019-04-04
#### Fixed
- Options of "Asset" filter on "System assets" => "Withdraw requests" now
  filtered correctly

## [1.4.0-rc.0] - 2019-04-01
#### Added
- Added "Use coinpayments" checkbox on asset creation page
- Reset account role to unverified action on user details

#### Changed
- Improved limits management page UI/UX:
  - More user-friendly titles and labels
  - Remove switcher elements from limit forms
  - Added "Unlimited" placeholder instead of switches
  management page
- Now order KYC request list by descending creation date

#### Fixed
- Loading user list after request reviewed

### "Under the hood" changes
#### Changed
- Replace "More" buttons with collection-loader components

#### Changed
- Moved `ACCOUNT_ROLES_VERBOSE` constant to the component data on the limits
- Cleaner `<input-field>`:
  - Set label default value to empty string
  - Auto-hiding of placeholder if label provided
  - Removed excess and unused `align` prop

#### Fixed
- Typo in `$field-placeholder-color` color variable

## [1.3.1] - 2019-03-14
#### Added
- Message for users with JavaScript switched off or browsers that don’t support
  JavaScript
- Restored email filter on "KYC requests" page
- Autocomplete for some email and address input fields

#### Removed
- Removed invest fee type

#### Fixed
- Showing of verification code in KYC request details
- Displaying of very long sale description string on "Sale request manager" tab

### "Under the hood" changes
#### Added
- Added filter for displaying app version

#### Removed
- Removed usages of 'provide-inject'
- Unused dependencies:
  - karma
  - mocha
  - sinon
  - nightwatch
  - bootstrap-sass
  - DocLinkGetter - unused `accountId` prop

#### Fixed
- Add missing quotes to `KEY_SERVER_ADMIN` of `config/default.env.js`

#### Security
- Resolve security issues in package.json

## [1.3.0] - 2019-03-01

[Unreleased]: https://github.com/tokend/admin-panel/compare/1.5.0...HEAD
[1.5.0]: https://github.com/tokend/admin-panel/compare/1.5.0-rc.3...1.5.0
[1.5.0-rc.3]: https://github.com/tokend/admin-panel/compare/1.5.0-rc.2...1.5.0-rc.3
[1.5.0-rc.2]: https://github.com/tokend/admin-panel/compare/1.5.0-rc.1...1.5.0-rc.2
[1.5.0-rc.1]: https://github.com/tokend/admin-panel/compare/1.5.0-rc.0...1.5.0-rc.1
[1.5.0-rc.0]: https://github.com/tokend/admin-panel/compare/1.4.0...1.5.0-rc.0
[1.4.0]: https://github.com/tokend/admin-panel/compare/1.4.0-rc.1...1.4.0
[1.4.0-rc.1]: https://github.com/tokend/admin-panel/compare/1.4.0-rc.0...1.4.0-rc.1
[1.4.0-rc.0]: https://github.com/tokend/admin-panel/compare/1.3.1...1.4.0-rc.0
[1.3.1]: https://github.com/tokend/admin-panel/compare/1.3.0...1.3.1
[1.3.0]: https://github.com/tokend/admin-panel/releases/tag/1.3.0
