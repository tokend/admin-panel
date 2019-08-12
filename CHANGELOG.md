# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Please check our [developers guide](https://gitlab.com/tokend/developers-guide)
for further information about branching and tagging conventions.

## [1.10.0] - 2019-08-12

## [1.10.0-rc.5] - 2019-08-06
#### Fixed
- A bug with stellar

## [1.10.0-rc.4] - 2019-08-06
### Added
- Update Erc20 and stellar tokens

## [1.10.0-rc.3] - 2019-08-05
#### Fixed
- Resolved the issue when admin can't create asset

## [1.10.0-rc.2] - 2019-08-02
#### Added
- Autoclose indicator to status-messages
- Erc20 token when create new asset

## [1.10.0-rc.1] - 2019-07-16
- Now using @tokend/js-sdk@1.9.0-rc.1

## [1.10.0-rc.0] - 2019-07-16

## [1.10.0-x.0] - 2019-07-12
#### Added
- `canBeBaseInAtomicSwap` and `canBeQuoteInAtomicSwap` policy for assets manager
- New kyc recovery request list page
- New kyc recovery request review page

#### Fixed
- Resolved issue when you can't update init assets(BTC, DOGE, USD)

### "Under the hood" changes
#### Changed
- Migrated "Asset pair" form to v3 endpoint
- Moved key values to vuex
  - Remove fields `ACCOUNT_ROLES`, `SIGNER_ROLES`, `ASSET_TYPES`, `POLL_TYPES`
    and `CHANGE_ROLE_TASKS` from configuration file
  - Replaced usages of `ACCOUNT_ROLES`, `SIGNER_ROLES`, `ASSET_TYPES`,
    `POLL_TYPES` and `CHANGE_ROLE_TASKS` width new fields from vuex storage

## [1.9.1] - 2019-07-15
#### Fixed
- Resolved an issue with error occurred on setting fee of capital deployment or
  invest types
- Resolved an issue with error occurred on setting fixed fee on of investment
  fee type (hide the field, fixed fee unavailable for this type)

## [1.9.0] - 2019-07-10

## [1.9.0-rc.2] - 2019-07-09
#### Removed
- Display of "available for issuance" and "issued" fields at top of asset
  "Manage asset" page

#### Fixed
- Display of asset code for existing assets on "Manage asset" page
- Display of asset type for existing assets on "Manage asset" page

### "Under the hood" changes
#### Removed
- Deleted unused `MasterAssets` components

## [1.9.0-rc.1] - 2019-07-08
#### Fixed
- Resolved the issue with invalid query param `''` sent to Horizon
- Resolved the issue with the status message shown under a modal background
- Resolved the issue when after clicking "sign in with seed" the Login field
  validation error occurred
- Resolved the issue when you can't upload and apply a "change asset issuer"
  offline operation
- Resolved the issue with an error shown after unblocking of a user and visiting
  their page again

## [1.9.0-rc.0] - 2019-06-24
#### Added
- New polls feature:
  - Poll requests browse page
  - Poll review page
  - Polls browse page
  - Poll and participants view page
- Stellar integration

#### Fixed
- Resolved issue with display of input and input date fields when they have no
  errors but allocated some space for errors at the bottom

### "Under the hood" changes
#### Added
- New `getAccountIdBy` to `apiHelper/users.js` that can detect argument as
  email or account Id and act accordingly

## [1.8.0] - 2019-06-22
### "Under the hood" changes
#### Changed
- Now using @tokend/js-sdk@1.8.0

## [1.8.0-rc.2] - 2019-06-21
#### Fixed
- Resolved an issue of invalidly shown limits if they followed pattern like 99,
  999, 9999 and so on.
- Stopped overriding of user input when entered value was lesser than "min"
  attribute of the field

## [1.8.0-rc.1] - 2019-06-17
#### Added
- Asset pair removal button to asset pair manager

#### Fixed
- Resolved bug with fulfilling non-system asset withdrawal requests
- Resolved "Pending tasks" field label overlap if no value selected
- Resolved bug with getting private documents

### "Under the hood" changes
#### Changed
- Now using @tokend/js-sdk@1.8.0-rc.1

## [1.8.0-rc.0] - 2019-06-06
#### Added
- Postal code field in kyc request review
- Collected fees management page
- External link icon to the "Learn more about pre-issuance" link
- Route-to-route loading bar
- "Whitelisted" row to the sale details & sale request details
- "Whitelist" tab to the sale details page

#### Changed
- Align asset requests detail values to right side
- Format kyc user's birthdate
- Now displaying "Yes" and "No" buttons on KYC queue confirmation
- Renamed "Master assets" to "System assets" on "Assets" menu
- Status message redesign
- Now using new form confirmation in the forms:
  - Manage admin form
  - Create asset pair form
  - Manage asset pair forms
  - Issuance form
  - Fee withdrawal form
  - Limits update form
  - Asset manager form

#### Removed
- "Fiat asset" checkbox from asset creation form

#### Fixed
- Show dash, if line 2 is not specified in kyc request
- Terms field appearance in asset request
- Error message styles on text field
- Select field arrow position
- Displaying asset request terms document
- Displaying error message if offline app file parsing was failed

### "Under the hood" changes
#### Added
- Usage of Unix line endings rule
- Vuelidate plugin for validating forms
- Security asset type to config
- Security asset type string to assetTypeToString filter
- Assets vuex module
- Wrappers for assets and balances
- Form confirmation component
- State bus for handling status messages

#### Changed
- Now using @tokend/js-sdk@1.8.0-rc.0
- Web client url in config changed to localhost:8060
- Now using Vuelidate and form mixin instead of
  native browser tools for validating forms
- Extracted fees updating to a separate form
- Extracted limits updating to a separate form
- Now using $attrs property for input field proxies
- Now providing only tasks to add to KYC reject request operation
- Now using "@mdi/font" instead of "mdi-vue"
- Now using the bus for emitting status messages
- Moved horizon resources to "/v3" endpoints
- Updated `package.json` dependencies

#### Removed
- Vee-validate plugin
- Unused vuex state mutations

## [1.7.0] - 2019-06-03
### "Under the hood" changes
#### Changed
- Now using @tokend/js-sdk@1.7.0

## [1.7.0-rc.4] - 2019-05-31
#### Fixed
- Pagination while loading limits on limits management page

## [1.7.0-rc.3] - 2019-05-30
#### Fixed
- Fixed Withdrawals screen list and review issues

### "Under the hood" changes
#### Changed
- Now using @tokend/js-sdk@1.7.0-rc.2

## [1.7.0-rc.2] - 2019-05-21
### "Under the hood" changes
#### Changed
- Some DevOps changes

## [1.7.0-rc.1] - 2019-05-21
### "Under the hood" changes
#### Changed
- Now using @tokend/js-sdk@1.7.0-rc.1

## [1.7.0-rc.0] - 2019-05-21
#### Added
- New "Capital deployment" fee type
- New KYC verification queue feature for quick requests review
- New links to pre-issuance guide on pre-issuance related pages
- New Sentry error tracking integration
- Displaying of "Unblocked" instead of "Change role request" in users operation
  list if the request performed by an admin
- Restored Terms field in asset details

#### Changed
- Limits management form:
  - Merged "specific account" and "scoped" tabs
  - Now showing "Not set" and "Unlimited" values accordingly
  - Added limits removal button
- Asset pair pages:
  - Added help messages to asset pair forms
  - Added "Physical price correction" and "Max price step" fields to asset pair
    management form
  - Now using custom confirmation message instead of the native one on asset
    pair creation submit

#### Changed
- Routing to UserDetails and OperationDetails pages from User and KYCRequest

#### Fixed
- Fixed a bug when we confirm a request for limits changes,
  at which we received empty values and could not confirm or cancel the request
- Fixed a bug with displaying of multiple overlayed confirmation modals on the
  issuance form
- Fixed uploading documents on create asset form
- Displaying of US-related roles on KYC review
- Displaying of asset filter on withdrawal list

#### Removed
- Removed "dev: " prefix from displayed version

### "Under the hood" changes
#### Added
- "US Verified" & "US Accredited" roles to the `roleIdToString` filter
- New "hash", "type", & "requestor" fields to `ChangeRoleRequest` wrapper
- New PDF documents preview to the `UserDocGetter` component
- New `help` prop to `<input-field>` and `<tick-field>`

#### Changed
- Now using @tokend/js-sdk@1.7.0-rc.0
- Extracted change role request tasks manager to a separate component

## [1.6.0] - 2019-05-09
### "Under the hood" changes
#### Changed
- Now using @tokend/js-sdk@1.6.0

## [1.6.0-rc.1] - 2019-05-02
#### Added
- Added autocomplete by email to email-acceptable filter fields

#### Changed
- Merged email and account ID filter fields

#### Removed
- Autocomplete for account ID on assets requests page’s filter field

## [1.6.0-rc.0] - 2019-05-02
#### Added
- New "Invest" fee type
- New re-render chart animations
- New master signer existence check on log in
- New KYC requests filter by pending tasks
- New US verified and US accredited account roles support
- New feature of managing pending tasks of KYC request
- New external details viewer of KYC request
- New release sanity check script, run it on pre-push

#### Fixed
- Fixed user operation list’s empty and loading states displaying
- Fixed updating user details after KYC request review
- Fixed an error after blocking the user without any previously verified
  KYC request
- Fixed some error reports

#### Changed
- Now displaying "Block" and "Reset to unverified" in user’s operation list
- Updated operation details formatting, hide some unnecessary fields
- Admin account id input is now unchangeable on Admin update screen

### "Under the hood" changes
#### Added
- New ESLint rules similar to web-client ones

#### Changed
- Now using @tokend/js-sdk@1.6.0-rc.0
- Replaced `ErrorHandler.process` with `ErrorHandler.processWithoutFeedback`
  in components' created hook
- Updated `package.json` dependencies
- Updated webpack build config
- Now using "qrcode.vue" package instead of "v-qrcode"

#### Removed
- Unnecessary "build" folder, containing old webpack config

## [1.5.0] - 2019-04-19
### "Under the hood" changes
#### Changed
- Now using @tokend/js-sdk@1.5.0

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

[Unreleased]: https://github.com/tokend/admin-panel/compare/1.10.0...HEAD
[1.10.0]: https://github.com/tokend/admin-panel/compare/1.10.0-rc.5...1.10.0
[1.10.0-rc.5]: https://github.com/tokend/admin-panel/compare/1.10.0-rc.4...1.10.0-rc.5
[1.10.0-rc.4]: https://github.com/tokend/admin-panel/compare/1.10.0-rc.3...1.10.0-rc.4
[1.10.0-rc.3]: https://github.com/tokend/admin-panel/compare/1.10.0-rc.2...1.10.0-rc.3
[1.10.0-rc.2]: https://github.com/tokend/admin-panel/compare/1.10.0-rc.1...1.10.0-rc.2
[1.10.0-rc.1]: https://github.com/tokend/admin-panel/compare/1.10.0-rc.0...1.10.0-rc.1
[1.10.0-rc.0]: https://github.com/tokend/admin-panel/compare/1.10.0-x.0...1.10.0-rc.0
[1.10.0-x.0]: https://github.com/tokend/admin-panel/compare/1.9.1...1.10.0-x.0
[1.9.1]: https://github.com/tokend/admin-panel/compare/1.9.0...1.9.1
[1.9.0]: https://github.com/tokend/admin-panel/compare/1.9.0-rc.2...1.9.0
[1.9.0-rc.2]: https://github.com/tokend/admin-panel/compare/1.9.0-rc.1...1.9.0-rc.2
[1.9.0-rc.1]: https://github.com/tokend/admin-panel/compare/1.9.0-rc.0...1.9.0-rc.1
[1.9.0-rc.0]: https://github.com/tokend/admin-panel/compare/1.8.0...1.9.0-rc.0
[1.8.0]: https://github.com/tokend/admin-panel/compare/1.8.0-rc.2...1.8.0
[1.8.0-rc.2]: https://github.com/tokend/admin-panel/compare/1.8.0-rc.1...1.8.0-rc.2
[1.8.0-rc.1]: https://github.com/tokend/admin-panel/compare/1.8.0-rc.0...1.8.0-rc.1
[1.8.0-rc.0]: https://github.com/tokend/admin-panel/compare/1.7.0...1.8.0-rc.0
[1.7.0]: https://github.com/tokend/admin-panel/compare/1.7.0-rc.4...1.7.0
[1.7.0-rc.4]: https://github.com/tokend/admin-panel/compare/1.7.0-rc.3...1.7.0-rc.4
[1.7.0-rc.3]: https://github.com/tokend/admin-panel/compare/1.7.0-rc.2...1.7.0-rc.3
[1.7.0-rc.2]: https://github.com/tokend/admin-panel/compare/1.7.0-rc.1...1.7.0-rc.2
[1.7.0-rc.1]: https://github.com/tokend/admin-panel/compare/1.7.0-rc.0...1.7.0-rc.1
[1.7.0-rc.0]: https://github.com/tokend/admin-panel/compare/1.6.0...1.7.0-rc.0
[1.6.0]: https://github.com/tokend/admin-panel/compare/1.6.0-rc.1...1.6.0
[1.6.0-rc.1]: https://github.com/tokend/admin-panel/compare/1.6.0-rc.0...1.6.0-rc.1
[1.6.0-rc.0]: https://github.com/tokend/admin-panel/compare/1.5.0...1.6.0-rc.0
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
