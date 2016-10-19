import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import {FormlyValueChangeEvent} from './../services/formly.event.emitter';
import {FormlyFieldConfig} from './formly.field.config';
import {FormlyConfig} from '../services/formly.config';

@Component({
  selector: 'formly-form',
  template: `
    <formly-field *ngFor="let field of fields"
      [hide]="field.hideExpression" [model]="field.key?model[field.key]:model"
      [form]="form" [field]="field" [formModel]="model"
      (modelChange)="changeModel($event)"
      [ngClass]="field.className">
    </formly-field>
    <ng-content></ng-content>
  `,
})
export class FormlyForm implements OnInit  {
  @Input() formModel: any;
  @Input() model: any;
  @Input() form: FormGroup;
  @Input() fields: FormlyFieldConfig[] = [];

  constructor(
    private formlyConfig: FormlyConfig,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    if (!this.model) {
      this.model = {};
    }
    if (!this.formModel) {
      this.formModel = this.model;
    }
    if (!this.form) {
      this.form = this.formBuilder.group({});
    }

    this.registerFormControls(this.fields, this.form, this.model);
  }

  changeModel(event: FormlyValueChangeEvent) {
    this.assignModelValue(this.model, event.key, event.value);
  }

  private registerFormControls(fields: FormlyFieldConfig[], form: FormGroup, model) {
    fields.map(field => {
      if (field.key && field.type) {
        this.initFieldTemplateOptions(field);
        this.initFieldValidation(field);

        let path: any = field.key;
        if (typeof path === 'string') {
          path = path.split('.');
        }

        if (path.length > 1) {
          let nestedForm = <FormGroup>(form.get(path[0]) ? form.get(path[0]) : new FormGroup({}, field.validation));
          if (!form.get(field.key)) {
            form.addControl(path[0], nestedForm);
          }
          path.shift();
          this.registerFormControls(
            [Object.assign({}, field, {key: path})],
            nestedForm,
            model[path[0]] || isNaN(path[0]) ? {} : []
          );
        } else {
          this.addFormControl(form, field, model[path[0]] || '');
        }
      }

      if (field.fieldGroup) {
        if (field.key) {
          const nestedForm = <FormGroup>(form.get(field.key) ? form.get(field.key) : new FormGroup({}, field.validation)),
            nestedModel = model[field.key] || {};

          if (!form.get(field.key)) {
            form.addControl(field.key, nestedForm);
          }

          this.registerFormControls(field.fieldGroup, nestedForm, nestedModel);
        } else {
          this.registerFormControls(field.fieldGroup, form, model);
        }
      }
    });
  }

  private initFieldTemplateOptions(field: FormlyFieldConfig) {
    field.templateOptions = Object.assign({
      label: '',
      placeholder: '',
      focus: false,
    }, field.templateOptions);
  }

  private initFieldValidation(field: FormlyFieldConfig) {
    if (Array.isArray(field.validation)) {
      let validators = [];
      field.validation.map((validate) => {
        validators.push(this.formlyConfig.getValidator(validate).validation);
      });
      field.validation = Validators.compose(validators);
    }
  }

  private addFormControl(form, field, model) {
    const componentType: any = this.formlyConfig.getType(field.type).component;
    if (componentType.createControl) {
      form.addControl(field.key, componentType.createControl(model, field));
    } else {
      form.addControl(field.key, new FormControl({ value: model, disabled: field.templateOptions.disabled }, field.validation));
    }
  }

  private assignModelValue(model, path, value) {
    if (typeof path === 'string') {
      path = path.split('.');
    }

    if (path.length > 1) {
      const e = path.shift();
      if (!model[e]) {
        model[e] = isNaN(path[0]) ? {} : [];
      }
      this.assignModelValue(model[e], path, value);
    } else {
      model[path[0]] = value;
    }
  }
}
