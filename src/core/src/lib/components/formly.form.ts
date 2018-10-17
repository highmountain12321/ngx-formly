import { Component, DoCheck, OnChanges, Input, SimpleChanges, Optional, EventEmitter, Output, SkipSelf, OnDestroy } from '@angular/core';
import { FormGroup, FormArray, NgForm, FormGroupDirective } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions, FormlyValueChangeEvent, FormlyFormOptionsCache } from './formly.field.config';
import { FormlyFormBuilder } from '../services/formly.form.builder';
import { FormlyConfig } from '../services/formly.config';
import { assignModelValue, isNullOrUndefined, reverseDeepMerge } from '../utils';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';

@Component({
  selector: 'formly-form',
  template: `
    <formly-field *ngFor="let field of fields"
      hide-deprecation
      [form]="field.form"
      [options]="field.options"
      [model]="field.model"
      [field]="field">
    </formly-field>
    <ng-content></ng-content>
  `,
})
export class FormlyForm implements DoCheck, OnChanges, OnDestroy {
  @Input() model: any = {};
  @Input() form: FormGroup | FormArray = new FormGroup({});
  @Input() fields: FormlyFieldConfig[] = [];
  @Input() options: FormlyFormOptions;
  @Output() modelChange = new EventEmitter<any>();

  /** @internal */
  @Input() isRoot = true;

  private initialModel: any;
  private modelChangeSubs: Subscription[] = [];

  private enableCheckExprDebounce = false;
  private checkExpressionChange$ = this.modelChange.pipe(
    debounceTime(this.enableCheckExprDebounce ? 100 : 0),
    tap(() => {
      this.enableCheckExprDebounce = true;
      this.checkExpressionChange();
      this.enableCheckExprDebounce = false;
    }),
  ).subscribe();

  constructor(
    private formlyBuilder: FormlyFormBuilder,
    private formlyConfig: FormlyConfig,
    @Optional() private parentForm: NgForm,
    @Optional() private parentFormGroup: FormGroupDirective,
    @Optional() @SkipSelf() private parentFormlyForm: FormlyForm,
  ) {}

  ngDoCheck() {
    this.checkExpressionChange();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.fields || this.fields.length === 0 || !this.isRoot) {
      return;
    }

    if (changes.fields || changes.form || changes.model) {
      this.model = this.model || {};
      this.form = this.form || (new FormGroup({}));
      this.setOptions();
      this.clearModelSubscriptions();
      this.formlyBuilder.buildForm(this.form, this.fields, this.model, this.options);
      this.trackModelChanges(this.fields);
      this.options.updateInitialValue();
    }
  }

  ngOnDestroy() {
    this.clearModelSubscriptions();
    this.checkExpressionChange$.unsubscribe();
  }

  changeModel(event: { key: string, value: any }) {
    assignModelValue(this.model, event.key, event.value);
    this.modelChange.emit(this.model);
  }

  setOptions() {
    this.options = this.options || {};

    this.options.formState = this.options.formState || {};
    if (!this.options.showError) {
      this.options.showError = this.formlyConfig.extras.showError;
    }
    if (!this.options.fieldChanges) {
      this.options.fieldChanges = new Subject<FormlyValueChangeEvent>();
    }

    if (!this.options.resetModel) {
      this.options.resetModel = (model ?: any) => {
        model = isNullOrUndefined(model) ? this.initialModel : model;
        if (this.model) {
          Object.keys(this.model).forEach(k => delete this.model[k]);
          Object.assign(this.model, model || {});
        }

        this.clearModelSubscriptions();
        this.formlyBuilder.buildForm(this.form, this.fields, this.model, this.options);
        this.trackModelChanges(this.fields);

        // we should call `NgForm::resetForm` to ensure changing `submitted` state after resetting form
        // but only when the current component is a root one.
        if (!this.parentFormlyForm && this.options.parentForm && this.options.parentForm.control === this.form) {
          this.options.parentForm.resetForm(model);
        } else {
          this.form.reset(model);
        }
      };
    }

    if (!this.options.parentForm) {
      this.options.parentForm = this.parentFormGroup || this.parentForm;
    }

    if (!this.options.updateInitialValue) {
      this.options.updateInitialValue = () => this.initialModel = reverseDeepMerge({}, this.model);
    }

    if (!(<FormlyFormOptionsCache> this.options)._buildForm) {
      (<FormlyFormOptionsCache> this.options)._buildForm = () => {
        this.clearModelSubscriptions();
        this.formlyBuilder.buildForm(this.form, this.fields, this.model, this.options);
        this.trackModelChanges(this.fields);
      };
    }
  }

  private checkExpressionChange() {
    if (this.isRoot && (<FormlyFormOptionsCache> this.options)._checkField) {
      (<FormlyFormOptionsCache> this.options)._checkField({ fieldGroup: this.fields, model: this.model, formControl: this.form, options: this.options });
    }
  }

  private trackModelChanges(fields: FormlyFieldConfig[], rootKey: string[] = []) {
    fields.forEach(field => {
      if (field.key && field.type && !field.fieldGroup) {
        const valueChanges = field.formControl.valueChanges.pipe(
          field.modelOptions.debounce && field.modelOptions.debounce.default
          ? debounceTime(field.modelOptions.debounce.default)
          : tap(() => {}),
          map(value => {
            if (field.parsers && field.parsers.length > 0) {
              field.parsers.forEach(parserFn => value = parserFn(value));
            }

            return value;
          }),
          tap(value => this.changeModel({ key: [...rootKey, field.key].join('.'), value })),
        );

        this.modelChangeSubs.push(valueChanges.subscribe());
      }

      if (field.fieldGroup && field.fieldGroup.length > 0) {
        this.trackModelChanges(field.fieldGroup, field.key ? [...rootKey, field.key] : rootKey);
      }
    });
  }

  private clearModelSubscriptions() {
    this.modelChangeSubs.forEach(sub => sub.unsubscribe());
    this.modelChangeSubs = [];
  }
}
