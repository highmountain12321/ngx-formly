import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-ns-checkbox',
  template: `
    <GridLayout class="input-field input-sides" rows="auto, auto" columns="*,*">
      <Label class="label" [text]="to.label"></Label>
      <Switch class="switch input" [formlyAttributes]="field" [formControl]="formControl" col="1"></Switch>
    </GridLayout>
  `,
})
export class FormlyFieldCheckbox extends FieldType {
  defaultOptions = {
    templateOptions: {
      hideLabel: true,
    },
  };
}
