import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-checkbox',
  template: `
    <div class="custom-control custom-checkbox">
      <input class="custom-control-input" type="checkbox"
        [class.is-invalid]="showError"
        [indeterminate]="to.indeterminate && field.formControl.value === null"
        [formControl]="formControl"
        [formlyAttributes]="field">
      <label class="custom-control-label" [for]="id">
        {{ to.label }}
        <span *ngIf="to.required && to.hideRequiredMarker !== true">*</span>
      </label>
    </div>
  `,
})
export class FormlyFieldCheckbox extends FieldType { }
