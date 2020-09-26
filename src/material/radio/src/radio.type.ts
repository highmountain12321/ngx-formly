import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FieldType } from '@ngx-formly/material/form-field';
import { MatRadioGroup } from '@angular/material/radio';
import { ɵwrapProperty as wrapProperty } from '@ngx-formly/core';

@Component({
  selector: 'formly-field-mat-radio',
  template: `
    <mat-radio-group
      [formControl]="formControl"
      [formlyAttributes]="field"
      [required]="to.required"
      [tabindex]="to.tabindex">
      <mat-radio-button *ngFor="let option of to.options | formlySelectOptions:field | async; let i = index;"
        [id]="id + '_' + i"
        [color]="to.color"
        [labelPosition]="to.labelPosition"
        [disabled]="option.disabled"
        [value]="option.value">
        {{ option.label }}
      </mat-radio-button>
    </mat-radio-group>
  `,
})
export class FormlyFieldRadio extends FieldType implements AfterViewInit, OnDestroy {
  @ViewChild(MatRadioGroup) radioGroup!: MatRadioGroup;
  defaultOptions = {
    templateOptions: {
      hideFieldUnderline: true,
      floatLabel: 'always',
      options: [],
      tabindex: -1,
    },
  };

  private focusObserver!: Function;
  ngAfterViewInit() {
    this.focusObserver = wrapProperty(this.field, 'focus', ({ currentValue }) => {
      if (
        this.to.tabindex === -1
        && currentValue
        && this.radioGroup._radios.length > 0
      ) {
        // https://github.com/ngx-formly/ngx-formly/issues/2498
        setTimeout(() => {
          const radio = this.radioGroup.selected
            ? this.radioGroup.selected
            : this.radioGroup._radios.first;

          radio.focus();
        });
      }
    });
  }

  ngOnDestroy() {
    this.focusObserver && this.focusObserver();
  }
}
