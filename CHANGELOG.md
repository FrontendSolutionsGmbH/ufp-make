# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [unreleased]

## [0.2.1] - 2017-10-24

- fix env variable init

## [0.2.0] - 2017-10-24

- fix seconds/ms output
- fix counts for main tasks
- promisify api entry points
- exit code 1 set if anything failed
- NODE_ENV set from UFP_NODE_ENV on start

## [0.1.6] - 2017-10-23

- version display from package.json for --version cli option

## [0.1.5] - 2017-10-22

- cwd - current working directory for tasks (state machine)
- pre/post - targets executed automatically before and after target
- testing various edge cases (endless loops referencing targets)
- output formatting, more timers, undefined

## [0.1.4] - 2017-10-20

- fix line endings to make shell execution actually work under linux

## [0.1.3] - 2017-10-20

- fix: main module entry point in package.json

## [0.1.2] - 2017-10-19

- Console output ms 

## [0.1.1] - 2017-10-19

- FIX: "#!/usr/bin/env node" included in binary

## [0.1.0] - 2017-10-19

### Added
- Initial Release


[Unreleased]: https://bitbucket.org/frontendsolutions/ufp-core/branches/compare/0.2.1...develop
[0.2.1]: https://github.com/FrontendSolutionsGmbH/ufp-make/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/FrontendSolutionsGmbH/ufp-make/compare/0.1.6...0.2.0
[0.1.6]: https://github.com/FrontendSolutionsGmbH/ufp-make/compare/0.1.5...0.1.6
[0.1.5]: https://github.com/FrontendSolutionsGmbH/ufp-make/compare/0.1.4...0.1.5
[0.1.4]: https://github.com/FrontendSolutionsGmbH/ufp-make/compare/0.1.3...0.1.4
[0.1.3]: https://github.com/FrontendSolutionsGmbH/ufp-make/compare/0.1.2...0.1.3
[0.1.2]: https://github.com/FrontendSolutionsGmbH/ufp-make/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/FrontendSolutionsGmbH/ufp-make/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/FrontendSolutionsGmbH/ufp-make/commits/0.1.0
