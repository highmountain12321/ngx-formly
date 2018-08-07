import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared';

import { ExamplesComponent } from './examples.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      { path: '', component: ExamplesComponent, children: [
        { path: '', pathMatch: 'full', redirectTo: 'introduction' },
        // Intro
        { path: 'introduction', loadChildren: './introduction/config.module#ConfigModule' },

        // Field Options
        { path: 'field-options', children: [
          { path: 'expression-properties', loadChildren: './field-options/expression-properties/config.module#ConfigModule' },
          { path: 'default-value', loadChildren: './field-options/default-value/config.module#ConfigModule' },
          { path: 'hide-fields', loadChildren: './field-options/hide-fields/config.module#ConfigModule' },
          { path: 'model-options', loadChildren: './field-options/model-options/config.module#ConfigModule' },
        ]},

        // Form Options
        { path: 'form-options', children: [
          { path: 'reset-model', loadChildren: './form-options/reset-model/config.module#ConfigModule' },
          { path: 'form-state', loadChildren: './form-options/form-state/config.module#ConfigModule' },
        ]},

        // validation
        { path: 'validation', children: [
          { path: 'built-in-validations', loadChildren: './validation/built-in-validations/config.module#ConfigModule' },
          { path: 'custom-validation', loadChildren: './validation/custom-validation/config.module#ConfigModule' },
          { path: 'validation-message', loadChildren: './validation/validation-message/config.module#ConfigModule' },
          { path: 'disable-submit-button', loadChildren: './validation/disable-submit-button/config.module#ConfigModule' },
          { path: 'matching-two-fields', loadChildren: './validation/matching-two-fields/config.module#ConfigModule' },
          { path: 'force-show-error', loadChildren: './validation/force-show-error/config.module#ConfigModule' },
          { path: 'toggle-required', loadChildren: './validation/toggle-required/config.module#ConfigModule' },
          { path: 'unique-value-async-validation', loadChildren: './validation/unique-value-async-validation/config.module#ConfigModule' },
          { path: 'async-validation-update-on', loadChildren: './validation/async-validation-update-on/config.module#ConfigModule' },
        ]},

        // Bootstrap Formly
        { path: 'bootstrap-formly', children: [
          { path: 'table-rows', loadChildren: './bootstrap-formly/table-rows/config.module#ConfigModule' },
          { path: 'select', loadChildren: './bootstrap-formly/select/config.module#ConfigModule' },
        ]},

        // Bootstrap Specific
        { path: 'bootstrap-specific', children: [
          { path: 'advanced-layout', loadChildren: './bootstrap-specific/advanced-layout/config.module#ConfigModule' },
          { path: 'bootstrap-horizontal', loadChildren: './bootstrap-specific/bootstrap-horizontal/config.module#ConfigModule' },
          { path: 'input-add-ons', loadChildren: './bootstrap-specific/input-add-ons/config.module#ConfigModule' },
        ]},

        // Advanced
        { path: 'advanced', children: [
          { path: 'i18n', loadChildren: './advanced/i18n/config.module#ConfigModule' },
          { path: 'json-schema', loadChildren: './advanced/json-schema/config.module#ConfigModule' },
          { path: 'repeating-section', loadChildren: './advanced/repeating-section/config.module#ConfigModule' },
          { path: 'datatable-integration', loadChildren: './advanced/datatable-integration/config.module#ConfigModule' },
          { path: 'multi-step-form', loadChildren: './advanced/multi-step-form/config.module#ConfigModule' },
          { path: 'tabs', loadChildren: './advanced/tabs/config.module#ConfigModule' },
        ]},

        // Other
        { path: 'other', children: [
          { path: 'cascaded-select', loadChildren: './other/cascaded-select/config.module#ConfigModule' },
          { path: 'observable-select', loadChildren: './other/observable-select/config.module#ConfigModule' },
          { path: 'advanced-layout-flex', loadChildren: './other/advanced-layout-flex/config.module#ConfigModule' },
          { path: 'nested-formly-forms', loadChildren: './other/nested-formly-forms/config.module#ConfigModule' },
          { path: 'hide-fields-with-animations', loadChildren: './other/hide-fields-with-animations/config.module#ConfigModule' },
          { path: 'button', loadChildren: './other/button/config.module#ConfigModule' },
          { path: 'json-powered', loadChildren: './other/json-powered/config.module#ConfigModule' },
          { path: 'input-file', loadChildren: './other/input-file/config.module#ConfigModule' },
        ]},
      ] },
    ]),
  ],
  declarations: [
    ExamplesComponent,
  ],
})
export class ExamplesModule { }
