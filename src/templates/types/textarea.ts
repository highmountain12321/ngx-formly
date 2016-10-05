import {Component} from '@angular/core';
import {Field} from './../field';

@Component({
  selector: 'formly-field-textarea',
  template: `
    <textarea name="{{key}}" [formControl]="formControl" id="{{key}}" cols="{{templateOptions.cols}}"
      rows="{{templateOptions.rows}}" [placeholder]="templateOptions.placeholder" class="form-control"
      [formlyNgFocus]="templateOptions.focus">
    </textarea>
  `,
})
export class FormlyFieldTextArea extends Field {
}
