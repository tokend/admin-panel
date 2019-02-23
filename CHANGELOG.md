# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Please check our [developers guide](https://gitlab.com/tokend/developers-guide)
for further information about branching and tagging conventions.

## [1.0.0-rc.8] - 2019-02-23
### Changed
- Use @tokend/js-sdk@1.0.0-x.17

## [1.0.0-rc.7] - 2019-02-23
### Added
- ApiCallerFactory
- More descriptive errors if cannot connect to horizon on startup
- Handle 400 bad signature
- rolIdToString and lowerCase filters

### Changed
- Use @tokend/js-sdk@1.0.0-x.15
- Use cheap-source-map
- EmailGetter
- Updated request states
- Removed unused tasks constants

### Removed
- `AssetPolicy.requiresKyc`
- `BlockReasons`
- `ACCOUNT_TYPES` and `ACCOUNT_TYPES_VERBOSE`
- Asking for signer types on login
- remove tokend-js-sdk usage
- unused KycReviewManager
- unused env files
- user 'block' button
- 'reset to unverified' button
- address and dates kyc fields from kyc view

### Fix
- keyServer use keyServerCaller from new-js-sdk
- admin updating, creating, deleting
- asset creating, updating, showing
- limits showing, updating, filtering
- fee list showing, updating, filtering
- email fetching by EmailGetter component
- app__form-actions positioning
- user list displyaing, user item displaying
- kyc retrieval, approval
- issuance displaying, approving, rejecting
- preissuance uploading
- preissuance asset signer changer
- more button pos
- token request displyaing, filtering, approving, rejecting
- preissuance request markup issues

## [1.2.0-rc.6] - 2019-02-20
### Added
- Build version displaying

## [1.2.0-rc.5] - 2019-02-20
### Fix
- Issue with wrongly set tasksToRemove on kyc approving

## [1.2.0-rc.4] - 2019-02-20
### Fix
- Kyc request
  - Fetching of the requests
  - Approve button showing
  - Approving of the request
  - Block button pos

## [1.2.0-rc.3] - 2019-02-20
### Changed
- Use @tokend/js-sdk@1.0.0-x.9

### Fixed
- Annoying check connection if the user is being logged in already

## [1.2.0-rc.2] - 2019-02-20
### Added
- Validation rules of asset code and asset name on asset management form

### Changed
- Use @tokend/js-sdk@1.0.0-x.8

### Removed
- Remove obsolete twoStepWithdrawal and withdrawableV2 policies

### Fixed
- Missing allTasks: 0 for AssetManager form
- Do not show connection message if the admin logged in

## [1.2.0-rc.1] - 2019-02-18
### Added
- Username validation in the SignUp form
- Filter funds by email
- Validation to set only numeric values in the Limits form
- Asset creation form validation

### Fixed
- Fund filter by owner id
- Pre-issuance uploading

## [1.2.0-rc.0] - 2019-02-18
### Changed
- Freezed dependencies’ versions
- Use @tokend/js-sdk@0.3.33

### Removed
- "Is coinpayments" checkbox in asset form

### Fixed
- Fixed approve Limits.Request
- Issue with ignored external system type change
- Issue with non-fetched asset and sale pictures
- KYC list updating
- Limits field validation
- Pair price updating

## [1.1.0] - 2019-02-07
### Added
- `jsconfig.json` for Visual Studio Code webpack alias support
- `cropAddress()` filter
- `ErrorHandler` class that shows feedback and logs the error
- `loglevel` package integrated

### Changed
- Update @tokend/js-sdk version to 0.3.20
- `<email-getter>` component shows cropped address instead of full one if the
  email fetching failed
- Increased default trailing zero precision of  `localize()` filter from 4 to 6
- Issuance form now accepts both email and addresses
- Refactor of description tab markup of fund and fund request
- Refactor of admin manager markup
- Tiny refactor of main.js (moved import of filters)

### Removed
- Redundant classes from SaleManager.SyndicateTab.vue
- Cleaned up config.js

### Fixed
- Displaying of the Details tab of a fund and fund request
- Displaying of the Full Description tab of a fund and fund request
- Video size on Description tab of fund and fund request
- `getEmailByAddress()` of `users.js` no longer throws exceptions when failed
  fetching of email
- Fix some terminology: remove the "investment portfolio" and "investment token"
  terms
- `getAccountIdByEmail()` of `users.js` not longer throws an invalid signature
  exception
- Titles of issuance history’s cells now show correct values
- Issuance again possible on the issuance page
- Issuance form now shows correct error message for every issue ocurred during
  the issuance
- Pre-issuance request list now fetches correctly the list

[Unreleased]: https://github.com/tokend/admin-panel/compare/1.2.0-rc.8...HEAD
[1.2.0-rc.8]: https://github.com/tokend/admin-panel/compare/1.2.0-rc.7...1.2.0-rc.8
[1.2.0-rc.7]: https://github.com/tokend/admin-panel/compare/1.2.0-rc.6...1.2.0-rc.7
[1.2.0-rc.6]: https://github.com/tokend/admin-panel/compare/1.2.0-rc.5...1.2.0-rc.6
[1.2.0-rc.5]: https://github.com/tokend/admin-panel/compare/1.2.0-rc.4...1.2.0-rc.5
[1.2.0-rc.4]: https://github.com/tokend/admin-panel/compare/1.2.0-rc.3...1.2.0-rc.4
[1.2.0-rc.3]: https://github.com/tokend/admin-panel/compare/1.2.0-rc.2...1.2.0-rc.3
[1.2.0-rc.2]: https://github.com/tokend/admin-panel/compare/1.2.0-rc.1...1.2.0-rc.2
[1.2.0-rc.1]: https://github.com/tokend/admin-panel/compare/1.2.0-rc.0...1.2.0-rc.1
[1.2.0]: https://github.com/tokend/admin-panel/compare/1.1.0...1.2.0-rc.0
[1.1.0]: https://github.com/tokend/admin-panel/releases/tag/1.1.0
