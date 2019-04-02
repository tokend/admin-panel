# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Please check our [developers guide](https://gitlab.com/tokend/developers-guide)
for further information about branching and tagging conventions.

## [Unreleased]
### Added
-  Added is_coinpayments checkbox on asset creation page

### Changed
- Hide input placeholder only if label prop is not empty
- Set input label prop default value to empty string
- Show "Unlimited" placeholder if limits are set to max limit value
- Titles & labels on limits management page
- Moved ACCOUNT_ROLES_VERBOSE constant to the component data on the limits
management page
- Edit of filter options by asset policy of withdrawable

### Fixed
- Typo in "$field-placeholder-color" color variable

### Removed
- Switch fields on limits management page
- Unnecessary align prop from input field

## [1.3.1] - 2019-03-14
### Added
- Added filter for displaying app version
- Added noscript tag with message for users with JavaScript switched off or browsers that don't support JavaScript

### Removed
- Unused dependencies:
  - karma
  - mocha
  - sinon
  - nightwatch
  - bootstrap-sass
  - DocLinkgetter - unused `accountId` prop
- Removed use 'provide-inject'

### Added
- Restored email filtering on kyc request page

### Removed
- Removed invest fee type from FeeList.vue

### Added
- Autocomplete for input fields

### Fixed
- Add missing quotes to `KEY_SERVER_ADMIN` of `config/default.env.js`
- Show verification code in KYC request details
- Displaying long sale description string on sale request manager tab

### Security
- Resolve security issues in package.json

## [1.3.0] - 2019-03-01

[Unreleased]: https://github.com/tokend/admin-panel/compare/1.3.1...HEAD
[1.3.1]: https://github.com/tokend/admin-panel/compare/1.3.0...1.3.1
[1.3.0]: https://github.com/tokend/admin-panel/releases/tag/1.3.0

### Changed
- Added collection-loader component
