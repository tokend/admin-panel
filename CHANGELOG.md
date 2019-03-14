# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Please check our [developers guide](https://gitlab.com/tokend/developers-guide)
for further information about branching and tagging conventions.

## [1.3.1] - 2019-03-14
### Added
- Added filter for displaying app version

### Removed
- Unused dependencies:
  - karma
  - mocha
  - sinon
  - nightwatch
  - bootstrap-sass
  - DocLinkgetter - unused `accountId` prop

### Fixed
- Add missing quotes to `KEY_SERVER_ADMIN` of `config/default.env.js`
- Show verification code in KYC request details

### Security
- Resolve security issues in package.json

## [1.3.0] - 2019-03-01

[Unreleased]: https://github.com/tokend/admin-panel/compare/1.3.1...HEAD
[1.3.1]: https://github.com/tokend/admin-panel/compare/1.3.0...1.3.1
[1.3.0]: https://github.com/tokend/admin-panel/releases/tag/1.3.0
