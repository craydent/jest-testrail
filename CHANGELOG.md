# Changelog

## [2.2.0] - 05/28/20


#### Features
- Automatically reading custom annotations and storing them without the need for a custom regex


#### Fixes
- Crash when there was a test with no ancestor/describe as the parent




## [2.1.1] - 05/01/19



#### Fixes
- Add publish script to ensure build before publish




## [2.1.0] - 04/26/19

#### Docs
- Added tests for new onRunComplete behavior

#### Features
- Added a way to continue w/ default behavior for onRunComplete


#### Fixes
- fix bug when onRunComplete throws error, the default behavior should not execute



## [2.0.1] - 04/25/19



#### Fixes
- fix breaking import because of the file relocation


## [2.0.0] - 04/07/19



#### Docs
- updated module to a TypeScript module



#### Fixes
- update incorrect tests and added support for ` style quotes


## [1.1.5] - 03/21/19



#### Fixes
- multiple automation ids for a single story only produced one test result




## [1.1.4] - 03/20/19



#### Fixes
- run time and time were not populating on the root




## [1.1.3] - 12/17/18

#### Fixes
- Fix crash when path to output directory does not exist


## [1.1.2] - 12/07/18

#### Docs
- Adding package-auto-version for CHANGELOG updatesCreate CHANGELOG.md.



#### Fixes
- Update git downloads to the correct url in the README.




## [1.1.1] - 12/06/18
#### Docs
- Updated README for tags.


#### Fixes
- Restricted tag syntax to alphanumeric.



## [1.1.0] - 12/06/18
#### Docs
- Added examples for hooks in the README.
- Updated README with tags.
- Updated README with latest features.
- Updated README with information about the data being passed to the templates.



#### Features
- Added custom hooks for reporter.
- Added custom tags support.
- Made match configurable to parse additional syntax.



#### Fixes
- Fixed metaObjects check so it is not always truthy.

#### Other
- Added RED/YELLOW/GREEN for use with console.log



## [1.0.0] - 12/05/18
#### Docs
- Complete and published v1.






