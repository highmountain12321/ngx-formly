import { Component, DoCheck, OnChanges, Input, SimpleChanges, Optional, EventEmitter, Output, SkipSelf } from '@angular/core';
import { FormControl, FormGroup, FormArray, NgForm, FormGroupDirective } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from './formly.field.config';
import { FormlyFormBuilder } from '../services/formly.form.builder';
import { FormlyFormExpression } from '../services/formly.form.expression';
import { assignModelValue, isNullOrUndefined, isObject, reverseDeepMerge, getKey, getValueForKey, getFieldModel } from '../utils';

@Component({
  selector: 'formly-form',
  template: `
    <formly-field *ngFor="let field of fields"
      [model]="fieldModel(field)" [form]="form"
      [field]="field" (modelChange)="changeModel($event)"
      [ngClass]="field.className"
      [options]="options">
    </formly-field>
    <ng-content></ng-content>
  `,
})
export class FormlyForm implements DoCheck, OnChanges {
  @Input() model: any = {};
  @Input() form: FormGroup = new FormGroup({});
  @Input() fields: FormlyFieldConfig[] = [];
  @Input() options: FormlyFormOptions;

  @Output() modelChange = new EventEmitter<any>();

  private initialModel: any;

  constructor(
    private formlyBuilder: FormlyFormBuilder,
    private formlyExpression: FormlyFormExpression,
    @Optional() private parentForm: NgForm,
    @Optional() private parentFormGroup: FormGroupDirective,
    @Optional() @SkipSelf() private parentFormlyForm: FormlyForm,
  ) {}

  ngDoCheck() {
    this.checkExpressionChange();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fields) {
      this.model = this.model || {};
      this.form = this.form || (new FormGroup({}));
      this.setOptions();
      this.formlyBuilder.buildForm(this.form, this.fields, this.model, this.options);
      this.updateInitialValue();
    } else if (changes.model && this.fields && this.fields.length > 0) {
      this.form.patchValue(this.model);
    }
  }

  fieldModel(field: FormlyFieldConfig) {
    if (field.key && (field.fieldGroup || field.fieldArray)) {
      return getFieldModel(this.model, field, true);
    }
    return this.model;
  }

  changeModel(event: { key: string, value: any }) {
    assignModelValue(this.model, event.key, event.value);
    this.modelChange.emit(this.model);
    if (this.parentFormlyForm) {
      this.parentFormlyForm.modelChange.next(
        this.parentFormlyForm.model,
      );
    }
    this.checkExpressionChange();
  }

  setOptions() {
    this.options = this.options || {};
    if (!this.options.resetModel) {
      this.options.resetModel = this.resetModel.bind(this);
    }

    if (!this.options.parentForm) {
      this.options.parentForm = this.parentFormGroup || this.parentForm;
    }

    if (!this.options.updateInitialValue) {
      this.options.updateInitialValue = this.updateInitialValue.bind(this);
    }
  }

  private checkExpressionChange() {
    // only eval expressions it's a root component
    if (!this.parentFormlyForm) {
      this.formlyExpression.checkFields(this.form, this.fields, this.model, this.options);
    }
  }

  private resetModel(model?: any) {
    model = isNullOrUndefined(model) ? this.initialModel : model;
    if (this.options.parentForm) {
      this.options.parentForm.resetForm(model);
    } else {
      this.form.reset(model);
    }

    this.resetFormGroup(model, this.form);
    this.resetFormModel(model, this.model);
  }

  private resetFormModel(model: any, formModel: any, path?: (string | number)[]) {
    if (!isObject(model) && !Array.isArray(model)) {
      return;
    }

    // removes
    for (let key in formModel) {
      if (!(key in model) || isNullOrUndefined(model[key])) {
        if (!this.form.get((path || []).concat(key))) {
          // don't remove if bound to a control
          delete formModel[key];
        }
      }
    }

    // inserts and updates
    for (let key in model) {
      if (!isNullOrUndefined(model[key])) {
        if (key in formModel) {
          this.resetFormModel(model[key], formModel[key], (path || []).concat(key));
        }
        else {
          formModel[key] = model[key];
        }
      }
    }
  }

  private resetFormGroup(model: any, form: FormGroup, actualKey?: string) {
    for (let controlKey in form.controls) {
      let key = getKey(controlKey, actualKey);
      if (form.controls[controlKey] instanceof FormGroup) {
        this.resetFormGroup(model, <FormGroup>form.controls[controlKey], key);
      }
      if (form.controls[controlKey] instanceof FormArray) {
        this.resetFormArray(model, <FormArray>form.controls[controlKey], key);
      }
      if (form.controls[controlKey] instanceof FormControl) {
        form.controls[controlKey].setValue(getValueForKey(model, key));
      }
    }
  }

  private resetFormArray(model: any, formArray: FormArray, key: string) {
    let newValue = getValueForKey(model, key);

    // removes and updates
    for (let i = formArray.length - 1; i >= 0; i--) {
      if (formArray.at(i) instanceof FormGroup) {
        if (newValue && !isNullOrUndefined(newValue[i])) {
          this.resetFormGroup(newValue[i], <FormGroup>formArray.at(i));
        }
        else {
          formArray.removeAt(i);
          let value = getValueForKey(this.model, key);
          if (Array.isArray(value)) {
            value.splice(i, 1);
          }
        }
      }
    }

    // inserts
    if (Array.isArray(newValue) && formArray.length < newValue.length) {
      let remaining = newValue.length - formArray.length;
      let initialLength = formArray.length;
      for (let i = 0; i < remaining; i++) {
        let pos = initialLength + i;
        getValueForKey(this.model, key).push(newValue[pos]);
        formArray.push(new FormGroup({}));
      }
    }
  }

  private updateInitialValue() {
    this.initialModel = reverseDeepMerge({}, this.model);
  }
}
