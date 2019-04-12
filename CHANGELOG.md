
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Please check our [developers guide](https://gitlab.com/tokend/developers-guide)
for further information about branching and tagging conventions.

## [Unreleased]
#### Added
- Added "Request type" select field on tokens requests page
- Validation for max amount on issuance form

#### Changed
- Issuance history list order reverted (now the oldest ones on top)
- Get token requests list from API v3
- Renamed `Fund(s)` -> `Sale(s)` and `Token(s)` -> `Asset(s)`

#### Fixed
- Getting private document URL on DocLinkGetter component
- Filtering sales by their owner

#### Removed
- Thresholds code leftovers
- Signing rules page

#### Fixed
- "You" label position in admin list
- Dropdown of user account widget when you hover button below it now stays above
  the button

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

[Unreleased]: https://github.com/tokend/admin-panel/compare/1.4.0...HEAD
[1.4.0]: https://github.com/tokend/admin-panel/compare/1.4.0-rc.1...1.4.0
[1.4.0-rc.1]: https://github.com/tokend/admin-panel/compare/1.4.0-rc.0...1.4.0-rc.1
[1.4.0-rc.0]: https://github.com/tokend/admin-panel/compare/1.3.1...1.4.0-rc.0
[1.3.1]: https://github.com/tokend/admin-panel/compare/1.3.0...1.3.1
[1.3.0]: https://github.com/tokend/admin-panel/releases/tag/1.3.0
