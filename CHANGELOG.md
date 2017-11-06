# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.0.0-beta.1"></a>
# [2.0.0-beta.1](https://github.com/formly-js/ng-formly/compare/v2.0.0-beta.0...v2.0.0-beta.1) (2017-11-03)


### Bug Fixes

* **textarea:**  set default value for rows and cols ([#546](https://github.com/formly-js/ng-formly/issues/546)) ([2a0f783](https://github.com/formly-js/ng-formly/commit/2a0f783))


### Features

* **validation:** move FormlyValidationMessage into core module ([#547](https://github.com/formly-js/ng-formly/issues/547)) ([da502f2](https://github.com/formly-js/ng-formly/commit/da502f2))



<a name="2.0.0-beta.0"></a>
# [2.0.0-beta.0](https://github.com/formly-js/ng-formly/compare/1.0.0-rc.14...2.0.0-beta.0) (2017-11-01)


### Bug Fixes

* replace deprecated OpaqueToken with InjectionToken ([#508](https://github.com/formly-js/ng-formly/issues/508)) ([fbf1dc3](https://github.com/formly-js/ng-formly/commit/fbf1dc3))
* **#514:** avoid supress and/or force validation messages. ([#524](https://github.com/formly-js/ng-formly/issues/524)) ([1ffe899](https://github.com/formly-js/ng-formly/commit/1ffe899))
* **field:** use showError instead of valid. ([2ba78a3](https://github.com/formly-js/ng-formly/commit/2ba78a3))


### Features

* **#536:** use standard-version for CHANGELOG generation ([#538](https://github.com/formly-js/ng-formly/issues/538)) ([9061311](https://github.com/formly-js/ng-formly/commit/9061311))
* **bootstrap:** support Bootstrap 4 Beta ([#529](https://github.com/formly-js/ng-formly/issues/529)) ([2b70567](https://github.com/formly-js/ng-formly/commit/2b70567))
* **core:** rename package to `@ngx-formly` + follow Angular Package Format. ([#497](https://github.com/formly-js/ng-formly/issues/497)) ([2197a51](https://github.com/formly-js/ng-formly/commit/2197a51))
* **demo:** use angular-cli for demo-example ([#542](https://github.com/formly-js/ng-formly/issues/542)) ([b8d6483](https://github.com/formly-js/ng-formly/commit/b8d6483))
* **field:** remove deprecated `valid` prop. ([#537](https://github.com/formly-js/ng-formly/issues/537)) ([88a9652](https://github.com/formly-js/ng-formly/commit/88a9652))
* **fieldChanges:** remove FormlyPubSub in favor of fieldChanges option. ([#525](https://github.com/formly-js/ng-formly/issues/525)) ([e78916f](https://github.com/formly-js/ng-formly/commit/e78916f))
* **label:** append with an asterisk when required ([#523](https://github.com/formly-js/ng-formly/issues/523)) ([bad3ecb](https://github.com/formly-js/ng-formly/commit/bad3ecb))
* **material:** initial work for ui-material ([#534](https://github.com/formly-js/ng-formly/issues/534)) ([11b8f9b](https://github.com/formly-js/ng-formly/commit/11b8f9b))
* remove deprecated options. ([#507](https://github.com/formly-js/ng-formly/issues/507)) ([6c46667](https://github.com/formly-js/ng-formly/commit/6c46667))
* replace deprecated `Renderer` by `Renderer2` ([#498](https://github.com/formly-js/ng-formly/issues/498)) ([0754b26](https://github.com/formly-js/ng-formly/commit/0754b26))
* use `ng-template` for dynamic components ([#499](https://github.com/formly-js/ng-formly/issues/499)) ([9203f1e](https://github.com/formly-js/ng-formly/commit/9203f1e))
* **npm:** add publish script ([#510](https://github.com/formly-js/ng-formly/issues/510)) ([0788a51](https://github.com/formly-js/ng-formly/commit/0788a51))
* **npm:** allow angular v5. ([#520](https://github.com/formly-js/ng-formly/issues/520)) ([1c6fb06](https://github.com/formly-js/ng-formly/commit/1c6fb06))
* **npm:** update packages. ([#522](https://github.com/formly-js/ng-formly/issues/522)) ([ecf5e0f](https://github.com/formly-js/ng-formly/commit/ecf5e0f))
* **validation-message:** move FormlyValidationMessages into FormlyConfig ([#526](https://github.com/formly-js/ng-formly/issues/526)) ([9b2e39f](https://github.com/formly-js/ng-formly/commit/9b2e39f))


### BREAKING CHANGES

* **field:** `Field::valid` is no longer available, use `showError` instead.
* **validation-message:** removed FormlyValidationMessages
* **fieldChanges:** removed FormlyPubSub.
