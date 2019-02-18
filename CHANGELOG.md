# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Please check our [developers guide](https://gitlab.com/tokend/developers-guide)
for further information about branching and tagging conventions.

## [Unreleased]
### Removed
- "Is coinpayments" checkbox in asset form

### Fixed
- Fixed approve Limits.Request
- Issue with ignored external system type change
- Issue with non-fetched asset and sale pictures
- KYC list updating
- Limits field validation
- Pair price updating
- Fund filter by owner id
- Pre-issuance uploading

### Added
- Username validation in the SignUp form
- Filter funds by email
- Validation to set only numeric values in the Limits form
- Asset creation form validation

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

[Unreleased]: https://github.com/tokend/admin-panel/compare/1.1.0...HEAD
[1.1.0]: https://github.com/tokend/admin-panel/releases/tag/1.1.0
