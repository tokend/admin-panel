# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Please check our [developers guide](https://gitlab.com/tokend/developers-guide)
for further information about branching and tagging conventions.

## [Unreleased]
### Fixed
- Fixed approve Limits.Request

## [1.1.0](https://github.com/tokend/admin-panel/releases/tag/1.1.0)
### Added
- `jsconfig.json` for Visual Studio Code webpack alias support
- `cropAddress` filter
- `ErrorHandler` class that shows feedback and logs the error
- `loglevel` package integrated

### Changed
- Update @tokend/js-sdk version to 0.3.20
- `email-getter` shows cropped address instead of full ont if the email fetching failed
- Refactor to description tab markup of fund and fund request
- Refactor to admin manager markup
- `localize()` of `localize.js` has 6 digits of default zero count now
- Issuance form now accepts both email and addresses
- Minor refactor to main.js (moved import of filters)

### Removed
- Redundant classes from SaleManager.SyndicateTab.vue
- Cleaned up config.js

### Fixed
- Displaying of the Details tab of a fund and fund request
- Displaying of the Full Description tab of a fund and fund request
- Video size on Description tab of fund and fund request
- `getEmailByAddress()` of `users.js` no longer throws exceptions when failed fetching of email
- Fix some terminology: remove the "investment portfolio" and "investment token" terms
- `getAccountIdByEmail()` of `users.js` not longer throws an invalid signature exception
- Titles of issuance history’s cells now show correct values
- Issuance again possible on the issuance page
- Issuance form now shows correct error message for every issue occured during the issuance
- Pre-issuance request list now fetches correctly the list

[Unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.1.0...HEAD
